import React from "react";

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center gap-4 p-4 bg-gray-800 text-white mt-auto">
      <p>
        Have feedback? Copalin – mail us at{" "}
        <a
          href="mailto:copalin@example.com"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          hi@algoanalytica.co.in
        </a>
      </p>
      <p>
        We truly appreciate your thoughts, suggestions, and constructive criticism.
        Your feedback helps us improve our services and create a better experience
        for everyone.
      </p>
      <p>
        Whether you have ideas for new features, want to report an issue, or simply
        want to share your experience, please feel free to reach out anytime.
        Stay connected and let us know how we can serve you even better. Thank you
        for being an important part of our community!
      </p>
    </footer>
  );
};

export default Footer;
