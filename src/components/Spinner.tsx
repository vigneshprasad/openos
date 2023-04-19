import {Puff} from "react-loader-spinner";

export const Spinner: React.FC = () => {
  return (
    <Puff
      color="#fff"
      width={20}
      height={20}
      radius={5}
    />
  )
}