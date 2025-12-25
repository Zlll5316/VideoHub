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

    // 解析 Notion 数据（复用 main.py 的逻辑）
    const videos = notionData.results?.map((page: any) => {
      const props = page.properties || {};
      
      // 辅助函数：解析属性值
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
          return propData.rich_text?.map((item: any) => item.plain_text).filter(Boolean) || [];
        }
        if (pType === 'title') {
          return propData.title?.map((item: any) => item.plain_text).filter(Boolean) || [];
        }
        return [];
      };

      // 提取 URL
      let url = '';
      if (props.URL?.type === 'url' && props.URL.url) {
        url = props.URL.url;
      } else if (props.URL?.type === 'rich_text') {
        url = getPropValues(props.URL)[0] || '';
      }

      // 提取分析内容
      let analysis = '';
      if (props.分析?.type === 'rich_text') {
        analysis = getPropValues(props.分析).join(' ') || '';
      }

      // 提取封面
      let cover = '';
      if (props.封面?.type === 'files' && props.封面.files?.[0]) {
        cover = props.封面.files[0].file?.url || props.封面.files[0].external?.url || '';
      }

      return {
        id: page.id,
        title: getPropValues(props.标题 || props.名称 || props.Name || props.Title)[0] || '无标题',
        url: url,
        cover: cover,
        analysis: analysis,
        company: getPropValues(props.公司 || props.品牌 || props.Company || props.Brand),
        animationType: getPropValues(props.动画类型 || props.AnimationType || props.Type),
        technique: getPropValues(props.表现手法 || props.Technique || props.Style),
        features: getPropValues(props.典型特征 || props.Features || props.Tags),
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
