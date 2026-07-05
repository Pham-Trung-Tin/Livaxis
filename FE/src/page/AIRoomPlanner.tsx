import { useIsMobile } from '../components/Header'
import { AIRoomPlannerDesktop } from './AIRoomPlannerDesktop'
import { AIRoomPlannerMobile } from './AIRoomPlannerMobile'

export default function AIRoomPlanner() {
  const isMobile = useIsMobile()
  return isMobile ? <AIRoomPlannerMobile /> : <AIRoomPlannerDesktop />
}
