import Lottie from "react-lottie-player"

import lottieJson from "public/lotties/spinner.json"

export const FadingCubesLoader: React.FC = () => {
  return (
    <Lottie
      loop
      play
      animationData={lottieJson}
      style={{width: 200, height: 200}}
    />
  )
}