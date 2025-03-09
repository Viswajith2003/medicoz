import { useState } from "react";
import { Mail, Lock, Apple } from "lucide-react";

const AuthPage = ({ onSignIn }) => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div className="min-h-screen bg-[#0d0e11] flex flex-col md:flex-row items-center justify-center md:justify-between p-8 md:p-16">
      <div className="text-white mb-8 md:mb-0 md:ml-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center md:text-left">
          AI Enhanced Medical
          <br />
          ChatBot
        </h1>
        <p className="text-gray-300 mb-8 text-center md:text-left">
          <span className="text-[#6ee867]">MediCoz:</span> Your Trusted Partner
          in Smart,
          <br />
          Seamless Healthcare.
        </p>
        <img
          src="/welcome.png"
          className="w-full h-auto max-w-[550px] max-h-[500px] mx-auto md:mx-0"
          alt="Medicine"
        />
      </div>
      <div className="flex items-center justify-center bg-gray-800 rounded-lg w-full max-w-[600px] p-8 md:p-12 my-2 mx-4 md:mx-20">
        <div className="rounded-3xl p-4 md:p-8 w-full max-w-[430px]">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-10 h-10" />
              <span className="text-white text-xl font-semibold">MediCoz</span>
            </div>
          </div>

          <div className="flex mb-8 bg-black p-2 rounded-lg w-full max-w-[243px] text-center mx-auto">
            <button
              className={`px-4 py-2 rounded-lg ${
                !isLogin ? "bg-[#5d5c65] text-white" : "text-gray-400"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign In
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                isLogin ? "bg-[#5d5c65] text-white" : "text-gray-400"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Create Account
            </button>
          </div>

          {isLogin ? (
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="text-gray-400 text-sm">Email</label>
                <input
                  type="email"
                  className="w-full bg-black rounded-lg p-3 text-white mt-1"
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Password</label>
                <input
                  type="password"
                  className="w-full bg-black rounded-lg p-3 text-white mt-1"
                  placeholder="Password"
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
            <form className="space-y-4">
              <button className="w-full bg-black text-white rounded-lg p-3 flex items-center justify-center gap-2">
                <img src="/google.png" alt="Google" className="w-6" />
                Google Account
              </button>
              <button className="w-full bg-black text-white rounded-lg p-3 flex items-center justify-center gap-2">
                <img src="/apple.png" alt="Apple" className="w-8" />
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
              <button
                className="w-full bg-emerald-500 text-white rounded-lg p-3 hover:bg-emerald-600 transition"
                type="button"
                onClick={onSignIn}
              >
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
    </div>
  );
};

export default AuthPage;
