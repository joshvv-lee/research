const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const DSR_CENTER = {
  lat: Number(process.env.DSR_CENTER_LAT || 37.48754),
  lng: Number(process.env.DSR_CENTER_LNG || 127.02863),
  radius: Number(process.env.SEARCH_RADIUS || 2000),
};

const MENU_MAP = {
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
  chicken: '치킨',
  bbq: '고기',
  pub: '술집',
  cafe: '카페',
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
  res.json({
    mapAppKey: process.env.KAKAO_JAVASCRIPT_KEY || '',
    dsrCenter: DSR_CENTER,
    availableMenus: MENU_MAP,
  });
});

app.get('/api/places', async (req, res) => {
  const selectedMenu = req.query.menu;
  const query = MENU_MAP[selectedMenu];

  if (!selectedMenu || !query) {
    return res.status(400).json({ message: '유효한 메뉴 카테고리를 선택해주세요.' });
  }

  if (!process.env.KAKAO_REST_API_KEY) {
    return res.status(500).json({ message: '서버에 KAKAO_REST_API_KEY가 설정되지 않았습니다.' });
  }

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', query);
  url.searchParams.set('x', String(DSR_CENTER.lng));
  url.searchParams.set('y', String(DSR_CENTER.lat));
  url.searchParams.set('radius', String(DSR_CENTER.radius));
  url.searchParams.set('category_group_code', 'FD6');
  url.searchParams.set('sort', 'distance');
  url.searchParams.set('size', '15');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ message: `카카오 API 호출 실패: ${text}` });
    }

    const data = await response.json();
    return res.json({
      menu: selectedMenu,
      places: data.documents,
      meta: data.meta,
    });
  } catch (error) {
    return res.status(500).json({ message: `검색 중 오류가 발생했습니다: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
