import { useIsMobile } from '../components/Header'
import { SubscriptionDesktop } from './SubscriptionDesktop'
import { SubscriptionMobile } from './SubscriptionMobile'

export default function SubscriptionPage() {
  const isMobile = useIsMobile()
  return isMobile ? <SubscriptionMobile /> : <SubscriptionDesktop />
}
