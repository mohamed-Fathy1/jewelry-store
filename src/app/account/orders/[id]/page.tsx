// Simplified status steps
const orderStatuses = [
  {
    status: "Ordered",
    completed: true,
  },
  {
    status: "Shipped",
    completed: true,
  },
  {
    status: "Out for delivery",
    completed: false,
  },
  {
    status: "Delivered",
    completed: false,
  },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage(props: Props) {
  const { id } = await props.params;

  console.log(id);

  return (
    <div className="w-full bg-white p-4 min-w-[300px]">
      {/* Status Header */}
      <div className="mb-6">
        <h2 className="text-[#B12704] text-xl font-medium">Shipped</h2>
        <p className="text-gray-600">Package arrived at carrier facility</p>
      </div>

      {/* Progress Tracker - added min-width to container */}
      <div className="relative mb-8 min-w-[300px] mx-auto max-w-[1000px]">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200">
          <div className="w-1/3 h-full bg-[#4CAF50]"></div>
        </div>

        {/* Status Points - added min-width to each status point */}
        <div className="flex justify-between relative">
          {orderStatuses.map((status) => (
            <div
              key={status.status}
              className="flex flex-col items-center min-w-[70px]"
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${
                  status.completed
                    ? "bg-[#4CAF50] text-white"
                    : "bg-gray-200 text-gray-400"
                }
                mb-2
              `}
              >
                {status.completed ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span className="text-sm text-gray-600 text-center">
                {status.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-[1000px] mx-auto">
        <button className="w-full p-2.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
          Share tracking
        </button>
        <button className="w-full p-2.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
          Buy again
        </button>
      </div>

      {/* Shipping Info */}
      <div className="mt-6">
        <h3 className="font-medium">Shipped with UPS</h3>
      </div>
    </div>
  );
}
