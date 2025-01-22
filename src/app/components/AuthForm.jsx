import { useState } from "react";
import { Mail, Lock, Apple } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0e11] flex items-center justify-between p-16 ">
      <div className="text-white ml-24">
        <h1 className="text-5xl font-bold mb-4">
          AI Enhanced Medical
          <br />
          ChatBot
        </h1>
        <p className="text-gray-300 mb-8">
          MediCoz: Your Trusted Partner in Smart,
          <br />
          Seamless Healthcare.
        </p>

        {/* Features */}
        <img
          src="/welcome.png"
          className="w-[550px] h-[500px] bg-[#5f2c2c]"
          alt="Medicine"
        />
      </div>

      <div className="bg-gray-800 rounded-3xl p-8 w-[430px]">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6" />

            <span className="text-white text-xl font-semibold">MediCoz</span>
          </div>
        </div>

        <div className="flex mb-8 bg-black p-2 rounded-lg w-[270px] text-center mx-12">
          <button
            className={`px-6 py-2 rounded-lg ${
              !isLogin ? "bg-[#5d5c65] text-white" : "text-gray-400"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign In
          </button>
          <button
            className={`px-6 py-2 rounded-lg ${
              isLogin ? "bg-[#5d5c65] text-white" : "text-gray-400"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Create Account
          </button>
        </div>

        {isLogin ? (
          // Register Form
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">First name</label>
                <input
                  type="text"
                  className="w-full bg-black rounded-lg p-3 text-white mt-1"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Last name</label>
                <input
                  type="text"
                  className="w-full bg-black rounded-lg p-3 text-white mt-1"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Password</label>
              <input
                type="password"
                className="w-full bg-black rounded-lg p-3 text-white mt-1"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Repeat password</label>
              <input
                type="password"
                className="w-full bg-black rounded-lg p-3 text-white mt-1"
                placeholder="Repeat password"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded bg-black border-gray-600"
              />
              <label className="text-gray-400 text-sm">
                I agree with Terms and conditions
              </label>
            </div>
            <button className="w-full bg-emerald-500 text-white rounded-lg p-3 hover:bg-emerald-600 transition">
              Create free account
            </button>
          </form>
        ) : (
          // Login Form
          <form className="space-y-4">
            <button className="w-full bg-black text-white rounded-lg p-3 flex items-center justify-center gap-2">
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              Google Account
            </button>
            <button className="w-full bg-black text-white rounded-lg p-3 flex items-center justify-center gap-2">
              <Apple className="w-5 h-5" />
              Apple Account
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-gray-800 text-gray-400 text-sm">
                  or
                </span>
              </div>
            </div>
            <div>
              <input
                type="email"
                className="w-full bg-black rounded-lg p-3 text-white"
                placeholder="Email"
              />
            </div>
            <div>
              <input
                type="password"
                className="w-full bg-black rounded-lg p-3 text-white"
                placeholder="Password"
              />
            </div>
            <button className="w-full bg-emerald-500 text-white rounded-lg p-3 hover:bg-emerald-600 transition">
              Sign In With Medicoz
            </button>
            <p className="text-gray-400 text-sm text-center">
              By creating an account, you agree to our Terms of Services and
              Privacy & Cookie Statements.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
