"use client"

import { Fragment, useState, useEffect } from "react"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { Link, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import useUserAuthStore from "../../store/userAuthStore/userAuthStore"

const navigation = [
  { name: "Home page", href: "/profile", current: false },
  { name: "Feedback", href: "/donor/feedback", current: false },
  { name: "Sponsored Student", href: "/donor/sponsored-student-details/", current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function DonorNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useUserAuthStore((state) => state.logout)
  const userEmail = localStorage.getItem("userEmail")

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:3333/ifl_system/adminCase/get-all-notifications")
        const allNotifications = response.data

        // Filter notifications for the current donor and not viewed
        const donorNotifications = allNotifications.filter(
          (notification) => notification.email === userEmail && !notification.viewed,
        )

        setNotifications(donorNotifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    if (userEmail) {
      fetchNotifications()
    }
  }, [userEmail])

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.post(`http://localhost:3333/ifl_system/adminCase/mark-notification-viewed/${notificationId}`)
      // Refresh notifications after marking as viewed
      const response = await axios.get("http://localhost:3333/ifl_system/adminCase/get-all-notifications")
      const allNotifications = response.data
      const donorNotifications = allNotifications.filter(
        (notification) => notification.email === userEmail && !notification.viewed,
      )
      setNotifications(donorNotifications)
    } catch (error) {
      console.error("Error marking notification as viewed:", error)
    }
  }

  return (
    <Disclosure as="nav" className="bg-[#0F172A] shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-[#1E3A8A] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6366F1] transition-colors duration-200">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo and company name - extreme left */}
              <div className="flex flex-shrink-0 items-center">
                <img className="h-10 w-auto object-contain" src="https://oec.org.pk/wp-content/uploads/2016/03/logo-trans-2012.png" alt="Company Logo" />
                <span className="ml-2 text-xl font-bold text-white hidden md:block">Investing In Future Learning</span>
              </div>

              {/* Navigation links - centered */}
              <div className="hidden sm:flex flex-1 justify-center">
                <div className="flex space-x-4">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <div
                        key={item.name}
                        onClick={() => navigate(item.href)}
                        className={classNames(
                          isActive ? "bg-[#6366F1] text-white" : "text-gray-300 hover:bg-[#1E3A8A] hover:text-white",
                          "rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200",
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.name}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notification and profile - extreme right */}
              <div className="flex items-center">
                {/* Notifications dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="relative rounded-full bg-[#0F172A] p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-colors duration-200">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
                      </span>
                    )}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm font-medium border-b border-gray-200">Notifications</div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 italic">No new notifications</div>
                        ) : (
                          notifications.map((notification) => (
                            <Menu.Item key={notification._id}>
                              {({ active }) => (
                                <Link
                                  to={notification.link}
                                  onClick={() => handleNotificationClick(notification._id)}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700 border-l-2 border-transparent hover:border-[#6366F1]",
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
                    <Menu.Button className="relative flex rounded-full bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-colors duration-200">
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
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">Donor Account</p>
                        <p className="text-sm text-gray-500 truncate">{userEmail || "user@example.com"}</p>
                      </div>

                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50",
                              )}
                            >
                              <UserIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50",
                              )}
                            >
                              <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                      </div>

                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 group",
                              )}
                              onClick={handleLogout}
                            >
                              <ArrowRightOnRectangleIcon
                                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500"
                                aria-hidden="true"
                              />
                              <span className="group-hover:text-red-500">Sign out</span>
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden bg-[#1E293B] shadow-lg border-t border-gray-700">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Disclosure.Button
                    key={item.name}
                    as="div"
                    onClick={() => navigate(item.href)}
                    className={classNames(
                      isActive ? "bg-[#6366F1] text-white" : "text-gray-300 hover:bg-[#1E3A8A] hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium cursor-pointer transition-all duration-200",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              })}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
