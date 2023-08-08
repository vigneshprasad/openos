import Lottie from "react-lottie-player"

import lottieJson from "public/lotties/spinner.json"

interface ILoaderProps {
    height?: number;
    width?: number;
}

export const FadingCubesLoader: React.FC<ILoaderProps> = ({ height, width }) => {
  return (
    <Lottie
        loop
        play
        animationData={lottieJson}
        style={{
            width: width ? width : 200, 
            height: height ? height : 200
        }}
    />
  )
}