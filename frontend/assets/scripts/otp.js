document.addEventListener("DOMContentLoaded", () => {
  const otpFields = document.querySelectorAll(".otp-field");
  const otpForm = document.querySelector(".otp-form");
  const otpInputs = document.querySelector(".otp-inputs");

  console.log("OTP JS loaded");
  console.log("OTP fields found:", otpFields.length);

  function fillOtpFields(code) {
    const digits = code.replace(/\D/g, "").slice(0, otpFields.length);

    otpFields.forEach((field, index) => {
      field.value = digits[index] || "";
    });

    if (digits.length === otpFields.length) {
      otpFields[otpFields.length - 1].focus();
    } else if (otpFields[digits.length]) {
      otpFields[digits.length].focus();
    }
  }
  function clearOtpFields() {
    otpFields.forEach((field) => {
      field.value = "";
    });

    if (otpFields.length > 0) {
      otpFields[0].focus();
    }
  }

  otpFields.forEach((field, index) => {
    field.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, "");

      if (value.length > 1) {
        fillOtpFields(value);
        return;
      }

      e.target.value = value;

      if (value && index < otpFields.length - 1) {
        otpFields[index + 1].focus();
      }
    });

    field.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !field.value && index > 0) {
        otpFields[index - 1].focus();
      }

      if (e.key === "ArrowLeft" && index > 0) {
        otpFields[index - 1].focus();
      }

      if (e.key === "ArrowRight" && index < otpFields.length - 1) {
        otpFields[index + 1].focus();
      }
    });
  });

  otpInputs.addEventListener("paste", (e) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    console.log("Pasted OTP:", pastedText);

    fillOtpFields(pastedText);
  });

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otpCode = Array.from(otpFields)
      .map((field) => field.value)
      .join("");

    if (otpCode.length !== 6) {
      alert("Please enter the 6-digit OTP code");
      return;
    }

    console.log("OTP Code:", otpCode);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            OTP: otpCode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        clearOtpFields();
        alert(data.error || "OTP verification failed");
        return;
      }

      if (data.success && data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      console.error("OTP error:", error);
      alert("Something went wrong while verifying OTP");
    }
  });
});
