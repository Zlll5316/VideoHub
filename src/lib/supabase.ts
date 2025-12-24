import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

console.log('🔧 Supabase 配置检查:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量！');
  console.error('请检查 .env 文件中是否有 VITE_SUPABASE_URL 和 VITE_SUPABASE_KEY');
  // 不抛出错误，而是创建一个假的客户端，让页面至少能显示
  // throw new Error('Missing Supabase environment variables');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
