import { Fragment } from "react"
import { Disclosure, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon, HomeIcon, UserIcon, PhoneIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { useNavigate, useLocation } from "react-router-dom"

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "About Us", href: "/aboutus", icon: UserIcon },
  { name: "Contact Us", href: "/contactus", icon: PhoneIcon },
  { name: "Login", href: "/signin", icon: UserIcon },
  { name: "Register", href: "/signup", icon: UserPlusIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (item) => {
    if (item.href) {
      navigate(item.href)
    } else if (item.onClick) {
      item.onClick()
    }
  }

  return (
    <Disclosure as="nav" className="bg-[#0F172A] shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center gap-3">
                  <img className="h-10 w-auto object-contain" src="https://oec.org.pk/wp-content/uploads/2016/03/logo-trans-2012.png" alt="Company Logo" />
                  <span className="text-xl font-bold text-white hidden md:block">Investing In Future Learning</span>
                </div>
              </div>

              {/* Desktop menu */}
              <div className="hidden sm:flex sm:items-center">
                <div className="hidden sm:flex sm:space-x-1 md:space-x-4">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item)}
                        className={classNames(
                          isActive ? "bg-[#6366F1] text-white" : "text-gray-300 hover:bg-[#1E3A8A] hover:text-white",
                          "group flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                        )}
                      >
                        <item.icon
                          className={classNames(
                            "mr-1.5 h-5 w-5 flex-shrink-0",
                            isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-[#1E3A8A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-colors duration-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Disclosure.Panel className="sm:hidden bg-[#1E293B] shadow-lg border-t border-gray-700">
              <div className="space-y-1 px-3 pb-3 pt-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as="div"
                      onClick={() => handleNavigation(item)}
                      className={classNames(
                        isActive ? "bg-[#6366F1] text-white" : "text-gray-300 hover:bg-[#1E3A8A] hover:text-white",
                        "flex items-center rounded-md px-3 py-2 text-base font-medium cursor-pointer transition-colors duration-200",
                      )}
                    >
                      <item.icon
                        className={classNames(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Disclosure.Button>
                  )
                })}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}
