import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowDown2, Notification } from 'iconsax-react'
import { Link, Outlet } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { headerNotifications } from '../services/mockData'

const USER_FIRST = 'Jon'
const USER_LAST = 'Smith'
const USER_ROLE = 'Admin'

function greetingPeriod(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function AppShell() {
  const period = useMemo(() => greetingPeriod(), [])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const bellMenuId = useId()
  const bellWrapRef = useRef<HTMLDivElement>(null)

  const sortedNotifications = useMemo(
    () => [...headerNotifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [],
  )
  const unreadCount = useMemo(() => headerNotifications.filter((notification) => !notification.read).length, [])
  const latestNotification = sortedNotifications[0]
  const bellAriaLabel = unreadCount === 1 ? 'Notifications, 1 unread' : `Notifications, ${unreadCount} unread`
  const bellTitle = latestNotification ? `${latestNotification.title}: ${latestNotification.message}` : 'No notifications'

  useEffect(() => {
    if (!notificationsOpen) return

    function onPointerDown(event: MouseEvent) {
      if (!bellWrapRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [notificationsOpen])

  return (
    <div className="app-shell">
      <header className="app-header app-header-seamless">
        <div className="app-header-inner">
          <Link to="/integrations" className="header-brand">
            <span className="header-brand-mark" aria-hidden>
              I
            </span>
            <span className="header-brand-text">Integration Sync Panel</span>
          </Link>

          <p className="header-greeting">
            Good {period},{' '}
            <strong>{USER_LAST}!</strong>
          </p>

          <div className="header-actions">
            <div className="header-bell-wrap" ref={bellWrapRef}>
              <Button
                type="button"
                className="header-bell"
                aria-label={bellAriaLabel}
                title={bellTitle}
                aria-expanded={notificationsOpen}
                aria-controls={bellMenuId}
                aria-haspopup="dialog"
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Notification className="header-bell-icon" color="currentColor" size={22} variant="Linear" aria-hidden />
                {unreadCount > 0 ? <span className="header-bell-badge" aria-hidden /> : null}
              </Button>

              {notificationsOpen ? (
                <div id={bellMenuId} className="header-notifications-panel" role="dialog" aria-label="Notifications">
                  <div className="header-notifications-head">
                    <strong>Notifications</strong>
                    <span>{unreadCount} unread</span>
                  </div>
                  <ul className="header-notifications-list">
                    {sortedNotifications.map((notification) => (
                      <li key={notification.id} className="header-notification-item">
                        <Link to={`/integrations/${notification.integrationId}`} onClick={() => setNotificationsOpen(false)}>
                          <div className="header-notification-row">
                            <span className="header-notification-title">{notification.title}</span>
                            {!notification.read ? <span className="header-notification-unread" aria-label="Unread" /> : null}
                          </div>
                          <p>{notification.message}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>


            <Button
              type="button"
              className="header-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Account menu"
            >
              <span className="header-user-avatar" aria-hidden>
                {USER_FIRST[0]}
                {USER_LAST[0]}
                <span className="header-user-online" />
              </span>
              <span className="header-user-meta">
                <span className="header-user-name">
                  {USER_FIRST} {USER_LAST}
                </span>
                <span className="header-user-role">{USER_ROLE}</span>
              </span>
              <ArrowDown2 className="header-chevron" color="currentColor" size={16} variant="Linear" aria-hidden />
            </Button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
