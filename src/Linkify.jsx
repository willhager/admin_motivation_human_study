import React from "react";

const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

function Linkify({ text }) {
  const parts = text.split(URL_REGEX);

  return parts.map((part, i) => {
    if (i % 2 === 0) return part;

    const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const url = trailing ? part.slice(0, -trailing.length) : part;
    const href = url.toLowerCase().startsWith("www.") ? `https://${url}` : url;

    return (
      <React.Fragment key={i}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        {trailing}
      </React.Fragment>
    );
  });
}

export default Linkify;