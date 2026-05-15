import { googleSheetService } from './googleSheetService';

export interface ValidationResult {
  success: boolean;
  error?: string;
  apiKey?: string;
  updatedCredit?: number;
}

/**
 * Validates user request before content generation according to business rules.
 */
export async function validateUserRequest(
  userId: string,
  deviceId: string,
  mode: 'admin' | 'trial' | 'pro' | 'enterprise',
  cost: number = 1,
  lang: 'EN' | 'VN' = 'VN'
): Promise<ValidationResult> {
  try {
    const result = await googleSheetService.fetchUser(userId);
    
    if (!result.success || !result.data) {
      return { 
        success: false, 
        error: lang === 'VN' ? "Không tìm thấy người dùng." : "User not found." 
      };
    }

    const user = result.data;
    const role = (user.role || '').trim().toLowerCase();
    const expiresAt = user.expires_at || user.plan_expiry_date;
    const isActiveValue = user.is_active === true || user.is_active === 'TRUE' || user.is_active === 1 || user.plan_status === 'active';
    const credits = Number(user.free_credits !== undefined ? user.free_credits : (user.credits || 0));

    // 2. Kiểm tra mode ngay lập tức - Admin là tầng cao nhất
    if (role === 'admin' || mode === 'admin') {
      return { success: true };
    }

    // 3. Nếu không phải admin mới kiểm tra expires_at
    if (expiresAt) {
      const now = new Date();
      const expiry = new Date(expiresAt);
      
      if (expiry < now) {
        return { 
          success: false, 
          error: lang === 'VN' ? "Gói đã hết hạn." : "Plan has expired." 
        };
      }
    }

    // 4. Check status
    if (!isActiveValue) {
      return { 
        success: false, 
        error: lang === 'VN' ? "Gói chưa được kích hoạt hoặc đã hết hạn." : "Plan not active or expired." 
      };
    }

    // 5. Handle remaining 3 modes: trial, pro, enterprise
    switch (mode) {
      case 'pro': {
        let apiKeys: string[] = [];
        if (typeof user.api_keys === 'string') {
          try {
            apiKeys = JSON.parse(user.api_keys);
          } catch {
            if (user.api_keys.trim()) {
              apiKeys = user.api_keys.split(',').map((s: string) => s.trim()).filter((s: string) => s);
            }
          }
        } else if (Array.isArray(user.api_keys)) {
          apiKeys = user.api_keys;
        }

        const apiKey = apiKeys?.[0];
        if (!apiKey) {
          return { 
            success: false, 
            error: lang === 'VN' ? "Không tìm thấy API Key hợp lệ." : "No valid API Key found." 
          };
        }
        return { success: true, apiKey };
      }

      case 'enterprise': {
        if (credits < cost) {
          return { 
            success: false, 
            error: lang === 'VN' ? "Không đủ credit." : "Insufficient credits." 
          };
        }
        
        const deductResult = await googleSheetService.deductCredits(userId, cost);
        if (!deductResult.success) {
          return {
            success: false,
            error: lang === 'VN' ? "Lỗi trừ credit." : "Credit deduction error."
          };
        }

        return { success: true, updatedCredit: credits - cost };
      }

      case 'trial':
      default:
        return { success: true };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: `${lang === 'VN' ? "Lỗi hệ thống" : "System error"}: ${error.message}` 
    };
  }
}
