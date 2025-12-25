import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 设置 CORS 头
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // 只允许 GET 请求
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const NOTION_API_KEY = process.env.NOTION_API_KEY || '';
    const DATABASE_ID = process.env.DATABASE_ID || '2d3e8a9a934180f08bf0f20a67aa1c62';

    if (!NOTION_API_KEY) {
      response.status(500).json({ 
        status: 'error', 
        message: 'NOTION_API_KEY 未配置' 
      });
      return;
    }

    // 调用 Notion API
    const notionResponse = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      }
    );

    if (!notionResponse.ok) {
      const errorText = await notionResponse.text();
      console.error('Notion API Error:', errorText);
      response.status(notionResponse.status).json({
        status: 'error',
        message: `Notion API 错误: ${notionResponse.status} ${notionResponse.statusText}`,
        details: errorText,
      });
      return;
    }

    const notionData = await notionResponse.json();

    // 辅助函数：从 YouTube URL 生成缩略图
    const getYoutubeThumbnail = (url: string): string => {
      try {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('/').pop()?.split('?')[0] || '';
        } else if (url.includes('v=')) {
          videoId = url.split('v=')[1]?.split('&')[0] || '';
        }
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } catch (e) {
        console.error('生成 YouTube 缩略图失败:', e);
      }
      return '';
    };

    // 解析 Notion 数据（完全复用 main.py 的逻辑）
    const videos = notionData.results?.map((page: any) => {
      const props = page.properties || {};
      
      // 辅助函数：解析属性值（完全匹配 main.py 的逻辑）
      const getPropValues = (propData: any): string[] => {
        if (!propData) return [];
        const pType = propData.type;
        
        if (pType === 'multi_select') {
          return propData.multi_select?.map((item: any) => item.name) || [];
        }
        if (pType === 'select') {
          return propData.select ? [propData.select.name] : [];
        }
        if (pType === 'rich_text') {
          // 对于公司/产品，如果用逗号分隔，这里负责拆分（匹配 main.py）
          const textList = propData.rich_text || [];
          if (textList.length > 0) {
            const rawText = textList.map((t: any) => t.plain_text || '').join('');
            if (rawText.includes(',')) {
              return rawText.split(',').map((t: string) => t.trim()).filter(Boolean);
            }
            return rawText ? [rawText] : [];
          }
          return [];
        }
        if (pType === 'title') {
          const textList = propData.title || [];
          return textList.length > 0 ? [textList[0].plain_text] : [];
        }
        return [];
      };

      // 1. 标题（匹配 main.py：使用 "名称"）
      const titleVals = getPropValues(props['名称'] || {});
      const title = titleVals[0] || '无标题';
      
      // 2. URL（匹配 main.py）
      const urlProp = props['URL'] || {};
      const videoUrl = urlProp.url || '';
      
      // 3. 视频分析（匹配 main.py：使用 "视频分析"，强行拼接所有碎片）
      let analysis = '';
      const analysisCol = props['视频分析'] || {};
      if (analysisCol.rich_text && Array.isArray(analysisCol.rich_text)) {
        analysis = analysisCol.rich_text.map((t: any) => t.plain_text || '').join('');
      }
      if (!analysis) {
        analysis = '暂无分析内容';
      }

      // 4. 封面（匹配 main.py：先检查 page.cover，再检查 props.封面，最后从 YouTube URL 生成）
      let coverImg = '';
      const coverData = page.cover;
      if (coverData) {
        if (coverData.type === 'external') {
          coverImg = coverData.external?.url || '';
        } else if (coverData.type === 'file') {
          coverImg = coverData.file?.url || '';
        }
      }
      // 如果页面封面不存在，检查属性中的封面
      if (!coverImg) {
        const coverProp = props['封面'] || {};
        if (coverProp.type === 'files' && coverProp.files?.[0]) {
          coverImg = coverProp.files[0].file?.url || coverProp.files[0].external?.url || '';
        }
      }
      // 如果还是没有，从 YouTube URL 生成
      if (!coverImg && videoUrl) {
        coverImg = getYoutubeThumbnail(videoUrl);
      }
      // 最后兜底
      if (!coverImg) {
        coverImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
      }

      // 5. 公司/品牌（匹配 main.py：使用 "公司/产品"）
      const company = getPropValues(props['公司/产品'] || props['公司'] || {});
      
      // 6. 动画类型（匹配 main.py：使用 "动画类型"）
      const animationType = getPropValues(props['动画类型'] || {});
      
      // 7. 表现手法（匹配 main.py：使用 "表现手法"）
      const technique = getPropValues(props['表现手法'] || {});
      
      // 8. 典型特征（匹配 main.py：使用 "典型特征"）
      const features = getPropValues(props['典型特征'] || {});

      return {
        id: page.id,
        title: title,
        url: videoUrl,
        cover: coverImg,
        analysis: analysis,
        company: company,
        animationType: animationType,
        technique: technique,
        features: features,
      };
    }) || [];

    response.status(200).json({
      status: 'success',
      data: videos,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    response.status(500).json({
      status: 'error',
      message: error.message || '服务器错误',
    });
  }
}
