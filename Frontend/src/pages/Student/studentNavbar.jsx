import { Fragment, useState, useEffect ,useContext} from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { StudentContext } from "../../api/studentContext"
import { fetchUserData } from "../../api/Systemapi";


import axios from "axios";

const navigation = [
  { name: "home", href: "/student/student_dashboard", current: false },
  { name: "Application Form", href: "/student_application", current: false },
  { name: "Feedback", href: "/student/feedback", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
 
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/signin");
    // localStorage.removeItem("hasFilledApplication");

  };
  
const { useGetStudent} = useContext(StudentContext);
const { isLoading, isError, data } = useGetStudent();

// const email = localStorage.getItem("userEmail");
useEffect(() => {
  if (localStorage.getItem("hasFilledApplication") === null) {
    localStorage.setItem("hasFilledApplication", "false");
  }
}, [])

const hasFilledApplication = localStorage.getItem("hasFilledApplication") === "true";

console.log(hasFilledApplication); 



  const userEmail = localStorage.getItem("userEmail");

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:3333/ifl_system/adminCase/get-all-notifications");
        const allNotifications = response.data;

        // Filter notifications for the current student and not viewed
        const studentNotifications = allNotifications.filter(
          (notification) => notification.email === userEmail && !notification.viewed
        );

        setNotifications(studentNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (userEmail) {
      fetchNotifications();
    }
  }, [userEmail]);

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.post(`http://localhost:3333/ifl_system/adminCase/mark-notification-viewed/${notificationId}`);
      // Refresh notifications after marking as viewed
      const response = await axios.get("http://localhost:3333/ifl_system/adminCase/get-all-notifications");
      const allNotifications = response.data;
      const studentNotifications = allNotifications.filter(
        (notification) => notification.email === userEmail && !notification.viewed
      );
      setNotifications(studentNotifications);
    } catch (error) {
      console.error("Error marking notification as viewed:", error);
    }
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://oec.org.pk/wp-content/uploads/2016/03/logo-trans-2012.png"
                    alt="Your Company"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                  {navigation
                  .filter((item) => !(hasFilledApplication  && item.name === "Application Form"))
                  .map((item) => (
                    <div
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium cursor-pointer"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                
                {/* Notifications dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
                      </span>
                    )}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-2">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Menu.Item key={notification._id}>
                              {({ active }) => (
                                <Link
                                  to={notification.link}
                                  onClick={() => handleNotificationClick(notification._id)}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  {notification.message}
                                </Link>
                              )}
                            </Menu.Item>
                          ))
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                <div className="mx-2"></div>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/student/student_dashboard"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block w-full px-4 py-2 text-left text-sm text-gray-700"
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
