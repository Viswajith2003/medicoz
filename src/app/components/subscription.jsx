import { useState } from "react";
import {
  X,
  Check,
  CreditCard,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";

const SubscriptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic chat functionality",
        "Limited message history",
        "Standard response time",
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$12",
      period: "monthly",
      features: [
        "Unlimited chats",
        "Priority response time",
        "Advanced features",
        "Dedicated support",
      ],
      current: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "yearly billing",
      features: [
        "Team management",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced security",
      ],
      current: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#121212] text-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-xl font-semibold flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Manage Subscription
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Select a subscription plan that best fits your needs. Upgrade
            anytime to access more features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`border ${
                  plan.current ? "border-green-500" : "border-gray-700"
                } rounded-lg p-5 relative`}
              >
                {plan.current && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    Current
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="flex items-baseline mt-2 mb-4">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2 px-4 rounded-lg ${
                    plan.current
                      ? "bg-gray-700 text-gray-300 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-lg flex items-start border border-gray-800">
            <Shield className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Secure Payment Processing</h4>
              <p className="text-sm text-gray-400">
                Your payment information is securely processed. We use
                industry-standard encryption to protect your data.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-400">
            <div className="flex items-center mb-4 md:mb-0">
              <Clock className="w-4 h-4 mr-2" />
              <span>Next billing cycle: March 28, 2025</span>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                <span>Billing history</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                <span>Payment methods</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
