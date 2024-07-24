import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  IconCarThing,
  IconCoffee,
  IconConnected,
  IconConnecting,
  IconLayoutgrid,
  IconLogo,
  IconLogoGear,
  IconLogs,
  IconTransfer
} from './icons'
import { useReward } from 'react-rewards'

type View = 'appsList' | 'adb' | 'logDisplay' | 'preferences' // Define possible views

interface SidebarProps {
  setCurrentView: Dispatch<SetStateAction<View>>
  currentView: View
}

const Sidebar: React.FC<SidebarProps> = ({ setCurrentView, currentView }) => {
  const [connections, setConnections] = useState<number>(0)
  const confettiConfig = {
    startVelocity: 6,
    elementCount: 7,
    decay: 0.99
  }
  const { reward } = useReward('rewardId', 'confetti', confettiConfig)
  const handleClick = (view: View): void => {
    setCurrentView(view)
  }

  const getConnections = (): void => window.electron.ipcRenderer.send('get-connections')

  useEffect(() => {
    const handleConnection = (_event, num: number): void => {
      setConnections(num)
      console.log('got connections', num)
    }

    console.log('got connections', connections)
    const removeListener = window.electron.ipcRenderer.on('connections', handleConnection)

    const timeoutId = setTimeout(() => {
      getConnections()
    }, 1500)

    return () => {
      removeListener()
      clearTimeout(timeoutId)
    }
  }, [])

  const version = process.env.PACKAGE_VERSION

  return (
    <div className="container w-full top-0 sm:pt-5 sm:justify-between sm:px-3 md:max-w-52 sm:max-w-24 gap-5 sm:relative rounded-lg flex sm:flex-col sm:overflow-y-hidden overflow-y-scroll items-center border-2 border-zinc-800 sm:h-full p-2">
      <div className="container w-full top-0 gap-5 sm:relative flex sm:flex-col items-center">
        <div className="flex items-center">
          {connections == 0 ? (
            <IconConnecting className="text-white pt-1" iconSize={24} />
          ) : (
            <div className="text-green-500 flex">
              <p className="text-xs">{connections == 1 ? '' : connections}</p>
              <IconConnected className=" pt-1" iconSize={24} />
            </div>
          )}
          <IconLogo width={110} height={30} iconSize={50} className={'hidden md:inline'} />
          <p className="text-sm hidden md:inline">v{version}</p>
        </div>
        <ul className="flex gap-5 sm:flex-col w-full">
          <li>
            <button
              className={`${currentView === 'appsList' ? 'bg-zinc-800 hover:bg-zinc-700 border-green-500' : 'hover:bg-zinc-900'} sm:border-l flex gap-3 rounded-md w-full p-3`}
              onClick={() => handleClick('appsList')}
            >
              <IconLayoutgrid />
              <span className="hidden md:inline">Apps</span>
            </button>
          </li>
          <li>
            <button
              className={`${currentView === 'adb' ? 'bg-zinc-800 hover:bg-zinc-700 border-green-500' : 'hover:bg-zinc-900'} sm:border-l rounded-md flex gap-3 w-full p-3`}
              onClick={() => handleClick('adb')}
            >
              <IconTransfer />
              <span className="hidden md:inline">ADB</span>
            </button>
          </li>
          <li>
            <button
              className={`${currentView === 'preferences' ? 'bg-zinc-800 hover:bg-zinc-700 border-green-500' : 'hover:bg-zinc-900'} sm:border-l rounded-md flex gap-3 w-full p-3`}
              onClick={() => handleClick('preferences')}
            >
              <IconCarThing strokeWidth={12} />
              <span className="hidden md:inline">Device</span>
            </button>
          </li>
          <li>
            <button
              className={`${currentView === 'logDisplay' ? 'bg-zinc-800 hover:bg-zinc-700 border-green-500' : 'hover:bg-zinc-900'} sm:border-l rounded-md flex gap-3 w-full p-3`}
              onClick={() => handleClick('logDisplay')}
            >
              <IconLogs />
              <span className="hidden md:inline">Logs</span>
            </button>
          </li>
        </ul>
      </div>
      <div className="flex sm:flex-col md:flex-row justify-start gap-3 w-full items-center text-zinc-500">
        <button className=" sm:border p-2 rounded-xl border-zinc-500 hover:bg-zinc-900 hover:text-white">
          <IconLogoGear iconSize={24} />
        </button>
        <a
          href="https://buymeacoffee.com/riprod"
          target="_blank"
          rel="noreferrer"
          className="fill-fuchsia-600 hover:bg-fuchsia-600 hover:text-black hover:border-fuchsia-600 text-fuchsia-600 sm:border p-2 rounded-xl border-zinc-500"
          onMouseEnter={reward}
        >
          <span id="rewardId" />
          <IconCoffee iconSize={24} strokeWidth={2} />
        </a>
      </div>
    </div>
  )
}

export default Sidebar
