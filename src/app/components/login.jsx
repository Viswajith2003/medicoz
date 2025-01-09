import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex h-screen">
        {/* Left section */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 bg-black text-white">
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold">
                Let's get <span className="text-cyan-400">creative!</span>
              </h1>
              <p className="mt-2 text-gray-400">
                Log in to Artificium to start creating magic.
              </p>
            </div>
            <form>
              <div className="mb-6">
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
            <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
              <span>or continue with</span>
            </div>
            <div className="mt-4 flex gap-4 justify-center">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:border-cyan-400">
                <img src="/google-logo.png" alt="Google" className="w-5 h-5" />
                Google Account
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:border-cyan-400">
                <img src="/apple-logo.png" alt="Apple" className="w-5 h-5" />
                Apple Account
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <a href="#" className="text-cyan-400 hover:underline">
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600">
          
        </div>
      </div>
    </>
  );
}
