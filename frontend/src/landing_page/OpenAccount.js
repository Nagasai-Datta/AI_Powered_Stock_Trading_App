import React from "react";

function OpenAccount() {
  return (
    <div className="container p-5 mb-5">
      <div className="row text-center">
        <h1 className="mt-5 mb-3">Open an Account today</h1>

        <p>
          Modern platforms and apps,Rs. 0 investment, and flat Rs. 20 intraday
          and F&O trades.
        </p>
        <br></br>
        <br></br>
        <button
          className="p-3 btn btn-primary fs-5"
          style={{ width: "20%", height: "65px", margin: "0 auto" }}
        >
          Signup Now
        </button>
      </div>
    </div>
  );
}

export default OpenAccount;
