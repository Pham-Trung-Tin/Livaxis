import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { MessageSquare, Trash2, AlertTriangle, X } from 'lucide-react'
import {
  getAdminFeedbacks,
  deleteFeedbackAdmin,
  type AdminFeedbackItem
} from '../../services/adminApi'
import { useToast } from '../../contexts/toast-context'

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast } = useToast()

  const fetchFeedbacks = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminFeedbacks()
      setFeedbacks(data)
    } catch (error: any) {
      showToast({ title: error.message || 'Lỗi khi tải danh sách phản hồi' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const confirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteFeedbackAdmin(deleteId)
      showToast({ title: 'Đã xóa phản hồi thành công' })
      setDeleteId(null)
      setIsDeleting(false)
      fetchFeedbacks()
    } catch (error: any) {
      showToast({ title: error.message || 'Lỗi khi xóa phản hồi' })
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phản hồi</h1>
          <p className="text-sm text-gray-500">Xem và quản lý các phản hồi từ người dùng</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7e5de8] border-r-transparent"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4 text-gray-300" />
            <p>Chưa có phản hồi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-4 font-medium">Người gửi</th>
                  <th className="pb-4 font-medium">Liên hệ</th>
                  <th className="pb-4 font-medium">Dịch vụ</th>
                  <th className="pb-4 font-medium">Nội dung</th>
                  <th className="pb-4 font-medium">Ngày tạo</th>
                  <th className="pb-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {feedbacks.map((item) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={item._id}
                    className="group transition-colors hover:bg-gray-50/50"
                  >
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-gray-600">{item.email || '-'}</div>
                      <div className="text-xs text-gray-400">{item.phone || '-'}</div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        {item.service}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="max-w-[300px] truncate text-gray-600" title={item.content}>
                        {item.content}
                      </p>
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Xóa phản hồi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Xác nhận xóa phản hồi</h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa phản hồi này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa phản hồi'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
