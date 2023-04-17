import { useState } from "react"

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("")

  return (
    <form>
      <label className="block">
        <span className="block text-sm font-medium text-[#C4C4C4]">Email address</span>
        <input
          type="text"
          className="block w-full mt-1 px-3 py-2 bg-[#0B0B0B] rounded-md border border-solid 
          border-[#0B0B0B] focus:border-solid focus:border-[#373737] text-sm font-medium
          text-[#fff]"
        />
      </label>
      <button type="submit" className="Button primary w-full mt-5">Send login link ✨</button>
    </form>
  )
}