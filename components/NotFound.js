import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="Not found">
      <div className="text-center">
        <h2>Whoops we can not find that page</h2>
        <p className="lead text-muted">
          Visit the <Link to="/">homepage</Link> if you are lost
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
