import Head from "next/head";

export default function Register() {
  return (
    <>
      <Head>
        <title>Register</title>
      </Head>
      <div className="flex h-screen bg-black text-white">
        {/* Left section */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16">
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center ">
              <h1 className="text-4xl font-bold">
                Hello, <span className="text-cyan-400">All</span>
              </h1>
              <p className="mt-2 text-gray-400">
                Log in to Artificium to start creating magic.
              </p>
            </div>
            <div className="flex gap-4 mb-6">
              <button className="flex items-center justify-center w-1/2 py-2 px-4 bg-gray-800 rounded-lg hover:bg-gray-700">
                <img
                  src="/google-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Sign In with Google
              </button>
              <button className="flex items-center justify-center w-1/2 py-2 px-4 bg-gray-800 rounded-lg hover:bg-gray-700">
                <img
                  src="/apple-logo.png"
                  alt="Apple"
                  className="w-5 h-5 mr-2"
                />
                Sign In with Apple
              </button>
            </div>
            <div className="text-center text-gray-400 mb-6">
              or continue with e-mail
            </div>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-400"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full mt-1 px-4 py-2 text-black border border-gray-600 rounded-lg focus:ring-cyan-400 focus:border-cyan-400"
                  placeholder="you@example.com"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full mt-1 px-4 py-2 text-black border border-gray-600 rounded-lg focus:ring-cyan-400 focus:border-cyan-400"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center text-sm text-gray-400">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-cyan-400 rounded border-gray-600 focus:ring-cyan-400"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="#" className="text-sm text-cyan-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-500"
              >
                Log in
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
              Don’t have an account?{" "}
              <a href="#" className="text-cyan-400 hover:underline">
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600">
          <div className="text-center px-6 max-w-lg">
            <blockquote className="text-lg italic text-gray-200 mb-6">
              “MediCoz has transformed the way we manage healthcare. The
              AI-enhanced chatbot provides personalized medical advice, helps us
              schedule appointments, and ensures medication adherence, saving
              patients and professionals countless hours while improving
              healthcare quality.”
            </blockquote>
            <div className="text-sm text-gray-400">
              
            </div>
            {/* Optional image */}
            <div className="mt-6">
              <img
                src="/profile-lily.png"
                alt="Lily Patel"
                className="rounded-lg shadow-lg max-h-64"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
