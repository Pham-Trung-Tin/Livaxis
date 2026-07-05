import { useIsMobile } from '../components/Header'
import { DiscoveryDesktop } from './DiscoveryDesktop'
import { DiscoveryMobile } from './DiscoveryMobile'

export function DiscoveryPage() {
  const isMobile = useIsMobile()
  return isMobile ? <DiscoveryMobile /> : <DiscoveryDesktop />
}

export default DiscoveryPage
