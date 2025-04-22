import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import Footer from "../Components/Footer";
import cookie from "js-cookie";
import { showToast } from "../Utils/toast";
import secrets from "../../secrets.js";
import { CgSpinner } from "react-icons/cg";
import axios from "axios";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

const { backendUrl } = secrets;

const Booking = () => {
  const navigate = useNavigate();
  const [totalPeople, setTotalPeople] = useState(1);
  const [isProgress, setIsProgress] = useState(false);
  const [resetProgress, setresetProgress] = useState(false);
  const [trainConfig, setTrainConfig] = useState({
    totalseats: 80,
    seatperrow: 7,
    lastrowseats: 3,
    availableseatcount: 80,
    bookedseatcount: 0,
    seats: Array(80)
      .fill()
      .map((_, index) => ({
        seatnumber: index + 1,
        isbooked: false,
      })),
  });

  const fetchTrainConfig = async () => {
    try {
      const options = {
        method: "GET",
        url: `${backendUrl}/user/train-config`,
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + cookie.get("token"),
        },
        useCredentials: true,
      };
      const response = await axios(options);
      console.log(response.data);
      setTrainConfig(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTrainConfig();
  }, []);

  const generateRows = () => {
    const totalRows = Math.ceil(
      trainConfig.totalseats / trainConfig.seatperrow
    );
    const rows = [];

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowNumber = rowIndex + 1;
      const isLastRow = rowNumber === totalRows;
      const seatsInThisRow = isLastRow
        ? trainConfig.lastrowseats
        : trainConfig.seatperrow;

      const rowSeats = [];
      for (let seatInRow = 0; seatInRow < seatsInThisRow; seatInRow++) {
        const seatIndex = rowIndex * trainConfig.seatperrow + seatInRow;
        if (seatIndex < trainConfig.totalseats) {
          rowSeats.push(trainConfig.seats[seatIndex]);
        }
      }

      rows.push({ rowNumber, seats: rowSeats });
    }

    return rows;
  };

  function getAvailableSeatsToBook(seatMap, count) {
    if (count > 7) throw new Error("Cannot book more than 7 seats");

    const totalRows = 12;
    const seatsPerRow = 7;
    const grid = [];

    for (let row = 0; row < totalRows; row++) {
      const start = row * seatsPerRow;
      const end = start + (row === totalRows - 1 ? 3 : seatsPerRow);
      grid[row] = seatMap.slice(start, end);
    }

    // Special case: 1 seat
    if (count === 1) {
      for (let row = 0; row < totalRows; row++) {
        for (const seat of grid[row]) {
          if (!seat.isbooked) {
            return [seat.seatnumber];
          }
        }
      }
      throw new Error("Not enough available seats");
    }

    // Try to find contiguous seats in closest row
    for (let row = 0; row < totalRows; row++) {
      const seats = grid[row];
      let run = [];

      for (let i = 0; i < seats.length; i++) {
        if (!seats[i].isbooked) {
          run.push(seats[i]);
          if (run.length === count) {
            return run.map((s) => s.seatnumber);
          }
        } else {
          run = [];
        }
      }
    }

    // If we can't find contiguous, then pick closest rows and fill them
    let remaining = count;
    const picked = [];

    for (let row = 0; row < totalRows; row++) {
      if (remaining === 0) break;
      const freeSeats = grid[row].filter((s) => !s.isbooked);
      const take = Math.min(remaining, freeSeats.length);
      picked.push(...freeSeats.slice(0, take));
      remaining -= take;
    }

    if (remaining > 0) {
      throw new Error("Not enough available seats");
    }

    return picked.map((s) => s.seatnumber).sort((a, b) => a - b);
  }

  const handleTokenExpired = () => {
    cookie.remove("token");
    cookie.remove("name");
    showToast("Session Expired, Please login again", "error");
    navigate("/auth");
  };

  const handleBook = async () => {
    if (!cookie.get("token")) {
      showToast("Please login first", "error");
      return;
    }

    try {
      setIsProgress(true);
      const availableSeats = getAvailableSeatsToBook(
        trainConfig.seats,
        totalPeople
      );

      // Update the trainConfig to mark selected seats as booked
      const updatedSeats = trainConfig.seats.map((seat) => {
        if (availableSeats.includes(seat.seatnumber)) {
          return { ...seat, isbooked: true };
        }
        return seat;
      });

      try {
        const options = {
          method: "POST",
          url: `${backendUrl}/user/book-seats`,
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + cookie.get("token"),
          },
          data: {
            seats: availableSeats,
          },
        };
        const response = await axios(options);
        console.log(response.data);
        showToast(
          `Successfully booked ${availableSeats.length} seats!`,
          "success"
        );
        setTrainConfig((prev) => ({
          ...prev,
          seats: updatedSeats,
          availableseatcount: prev.availableseatcount - availableSeats.length,
          bookedseatcount: prev.bookedseatcount + availableSeats.length,
        }));
      } catch (error) {
        console.error(error);
        if (error.response.data.error == "Token expired") {
          handleTokenExpired();
          return;
        }
        showToast("Something went wrong", "error");
        return;
      }
    } catch (error) {
      showToast(error.message, "error");
      console.error(error);
    } finally {
      setIsProgress(false);
    }
  };

  const FetchName = () => {
    return cookie.get("name") ? (
      <div className="flex items-center gap-3">
        <p>Hii {cookie.get("name")} 👋</p>
        <RiLogoutCircleRLine
          className="text-red-400 text-xl cursor-pointer"
          onClick={() => {
            cookie.remove("token");
            cookie.remove("name");
            showToast("Logged out successfully", "success");
            navigate("/auth");
          }}
        />
      </div>
    ) : (
      <p
        onClick={() => {
          navigate("/auth");
        }}
      >
        Login
      </p>
    );
  };

  const handleReset = async () => {
    if (!cookie.get("token")) {
      showToast("Please login first", "error");
      return;
    }

    setresetProgress(true);

    const options = {
      method: "PATCH",
      url: `${backendUrl}/user/reset-seats`,
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + cookie.get("token"),
      },
      useCredentials: true,
    };

    try {
      const response = await axios(options);
      console.log(response.data);
      if (response.data.status === "success") {
        showToast("Seats reset successfully", "success");
        setTrainConfig((prev) => ({
          ...prev,
          seats: Array(80)
            .fill()
            .map((_, index) => ({
              seatnumber: index + 1,
              isbooked: false,
            })),
          availableseatcount: 80,
          bookedseatcount: 0,
        }));
      }
    } catch (error) {
      console.error(error);
      if (error.response.data.error == "Token expired") {
        handleTokenExpired();
        return;
      }
      showToast("Something went wrong", "error");
    } finally {
      setresetProgress(false);
    }
  };

  return (
    <div className="bg-[#131313] min-h-screen w-full p-3 flex flex-col md:flex-row gap-7">
      <div className="w-full flex flex-col items-center justify-start pt-5 overflow-auto">
        <h2 className="text-white mb-5 font-semibold text-xl">
          Seats Positioning
        </h2>
        <div className="w-fit flex flex-col justify-center items-start">
          {generateRows().map((row) => (
            <div key={row.rowNumber} className="flex mb-2 px-2 md:px-5">
              <div className="flex gap-1 md:gap-2 min-w-max">
                {row.seats.map((seat) => (
                  <div
                    key={seat.seatnumber}
                    className={`w-[2.5rem] h-[2.5rem] md:w-[3.5rem] md:h-[3.5rem] rounded-md border border-white/20 flex items-center justify-center text-white text-sm md:text-base ${
                      seat.isbooked
                        ? "bg-red-500"
                        : "bg-transparent hover:bg-white/10 active:bg-white/20"
                    } cursor-pointer`}
                    title={
                      seat.isbooked
                        ? "Seat not available"
                        : "This seat is available"
                    }
                  >
                    {seat.seatnumber}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex w-full mt-4 flex-col px-2 md:px-5">
            <p className="text-white/80 font-normal text-sm md:text-base">
              Available Seats: {trainConfig.availableseatcount}
            </p>
            <p className="text-white/80 font-normal text-sm md:text-base">
              Booked Seats: {trainConfig.bookedseatcount}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center mt-4 md:mt-0">
        <div className="px-4 py-1 md:px-5 md:py-2 rounded-3xl bg-white absolute top-2 right-2 md:top-8 md:right-10 flex items-center gap-2 md:gap-3 text-sm md:text-base">
          <FetchName />
        </div>
        <div className="w-full md:w-2/4 flex flex-wrap justify-center items-center text-white gap-1 md:gap-2">
          {Array.from({ length: totalPeople }).map((_, index) => (
            <BsPersonFill key={index} className="text-2xl md:text-4xl" />
          ))}
        </div>
        <div className="w-full md:w-fit flex flex-col items-center py-3 md:py-5 px-4 md:px-10 rounded-lg">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-white/80 font-normal text-sm md:text-base">
              Book Seats for
            </h3>
            <p className="text-white text-xl md:text-3xl font-bold mt-1">
              {totalPeople} {totalPeople > 1 ? "people" : "person"}
            </p>
          </div>
          <div className="w-fit flex gap-3 mt-3 md:mt-5">
            <button
              className="rounded-lg p-3 md:p-5 text-lg md:text-xl text-white border-white/20 border active:scale-[0.85] transition-all duration-200"
              onClick={() => {
                if (totalPeople > 1) {
                  setTotalPeople(totalPeople - 1);
                }
              }}
            >
              <FaMinus />
            </button>
            <button
              className="rounded-lg p-3 md:p-5 text-lg md:text-xl text-white border-white/20 border active:scale-[0.85] transition-all duration-200"
              onClick={() => {
                if (totalPeople < 7) {
                  setTotalPeople(totalPeople + 1);
                }
              }}
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex gap-2 md:gap-3 mt-3 md:mt-5 w-full">
            <button
              className="bg-green-400 font-semibold py-2 md:py-3 px-4 md:px-10 rounded-sm w-full active:scale-[0.97] transition-all duration-100 flex gap-2 items-center justify-center text-sm md:text-base"
              onClick={handleBook}
              disabled={isProgress}
            >
              {isProgress ? (
                <CgSpinner className="animate-spin text-lg md:text-xl" />
              ) : (
                <p>Book</p>
              )}
            </button>
            <button
              className="bg-red-500 text-white font-semibold py-2 md:py-3 px-4 md:px-10 rounded-sm w-full active:scale-[0.97] transition-all duration-100 flex gap-2 items-center justify-center text-sm md:text-base"
              onClick={handleReset}
              disabled={resetProgress}
            >
              {resetProgress ? (
                <CgSpinner className="animate-spin text-lg md:text-xl" />
              ) : (
                <p>Reset</p>
              )}
            </button>
          </div>
          <div className="w-full flex flex-col gap-2 items-center mt-10">
            <Link
              to={"https://github.com/orgs/Seat-Booking-System/repositories"}
              target="_blank"
              className="text-white font-extralight hover:cursor-pointer hover:text-white/80 transition-all duration-200"
            >
              Source Code
            </Link>
            <Link
              to={"https://www.adidecodes.com"}
              target="_blank"
              className="text-white font-extralight hover:cursor-pointer hover:text-white/80 transition-all duration-200"
            >
              Made with ❤️ by Aditya
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
