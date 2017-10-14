import React from "react";
import IcongSVG from "../IconSVG";
import { invalidReponseStyles } from "../../Styles/Theme";

export default function Page404() {
  return (
    <div className={`${invalidReponseStyles}`}>
      <IcongSVG name="icon-baffled" />
      <h1>404</h1>
      <h2> Page Not Found </h2>
    </div>
  );
}
