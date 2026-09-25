import {JSX} from "solid-js";

interface DisclaimerProps {
  children: JSX.Element;
}

export default function Disclaimer(props: DisclaimerProps) {
  return <p class="disclaimer">{props.children}</p>;
}
