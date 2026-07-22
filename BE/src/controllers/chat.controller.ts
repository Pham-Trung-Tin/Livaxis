import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env'; // Or I will just use process.env directly since env.ts might not have GEMINI_API_KEY
import Product from '../models/product.model';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `Bạn là trợ lý ảo hỗ trợ khách hàng của Livaxis - một nền tảng thiết kế nội thất sang trọng bằng AI (AI Room Planner) và thương mại điện tử nội thất cao cấp. Các sản phẩm của chúng tôi bao gồm Sofa, Bàn, Ghế, Giường, Đèn, Tủ kệ và Đồ trang trí. Tính năng nổi bật là cho phép người dùng tải ảnh phòng lên và AI sẽ gợi ý bố trí nội thất phù hợp. Các gói dịch vụ bao gồm Free (3 lượt AI/ngày), Starter, Standard và Premium.

Quy tắc quan trọng: Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan đến nền tảng Livaxis, nội thất, thiết kế phòng, điều khoản dịch vụ và thanh toán. Nếu người dùng hỏi các vấn đề ngoài lề (ví dụ: lập trình, chính trị, công thức nấu ăn, v.v.), bạn phải lịch sự từ chối trả lời và hướng họ quay lại các chủ đề về không gian sống và nội thất của Livaxis.`;

export const handleChat = async (req: Request, res: Response): Promise<void> => {
	try {
		const { message, history } = req.body;

		if (!message) {
			res.status(400).json({ success: false, error: 'Message is required' });
			return;
		}

		// Convert history to format accepted by Gemini if needed.
		// For simplicity, we just create a single content if it's the first message,
		// or append to history.
		const contents = [];
		
		if (history && Array.isArray(history)) {
			history.forEach((msg: any) => {
				contents.push({
					role: msg.role === 'ai' ? 'model' : 'user',
					parts: [{ text: msg.text }]
				});
			});
		}
		
		contents.push({
			role: 'user',
			parts: [{ text: message }]
		});

		// Dynamic context injection (RAG-lite)
		const productCount = await Product.countDocuments();
		const categories = await Product.distinct('category');
		const dynamicContext = `\n\n[DỮ LIỆU THỰC TẾ TRONG HỆ THỐNG (KHÔNG ĐƯỢC BỊA ĐẶT)]: 
Hiện tại cửa hàng có chính xác ${productCount} sản phẩm, bao gồm các danh mục: ${categories.join(', ')}. 
Hãy sử dụng thông tin này nếu người dùng hỏi về số lượng sản phẩm hay danh mục.`;

		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: contents,
			config: {
				systemInstruction: SYSTEM_INSTRUCTION + dynamicContext,
				temperature: 0.7,
			}
		});

		res.status(200).json({
			success: true,
			data: {
				text: response.text,
			}
		});
	} catch (error: any) {
		console.error('Chat AI Error:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Lỗi kết nối tới AI Assistant',
		});
	}
};
