let map;
let markers = [];

const menuSelect = document.getElementById('menuSelect');
const searchButton = document.getElementById('searchButton');
const placeList = document.getElementById('placeList');

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function renderList(places) {
  placeList.innerHTML = '';

  if (!places.length) {
    placeList.innerHTML = '<li>조건에 맞는 식당이 없습니다.</li>';
    return;
  }

  places.forEach((place) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${place.place_name}</strong> · ${place.road_address_name || place.address_name} · ${place.phone || '전화번호 없음'}`;
    placeList.appendChild(li);
  });
}

function renderMarkers(places) {
  clearMarkers();

  const bounds = new kakao.maps.LatLngBounds();

  places.forEach((place) => {
    const position = new kakao.maps.LatLng(Number(place.y), Number(place.x));
    bounds.extend(position);

    const marker = new kakao.maps.Marker({
      map,
      position,
      title: place.place_name,
    });

    const infoWindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:6px 8px;font-size:12px;">${place.place_name}</div>`,
    });

    kakao.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });

  if (places.length) {
    map.setBounds(bounds);
  }
}

async function fetchPlaces() {
  const menu = menuSelect.value;
  if (!menu) {
    alert('먼저 메뉴 카테고리를 선택해주세요.');
    return;
  }

  const response = await fetch(`/api/places?menu=${menu}`);
  const data = await response.json();

  if (!response.ok) {
    alert(data.message || '검색에 실패했습니다.');
    return;
  }

  renderList(data.places);
  renderMarkers(data.places);
}

function loadKakaoMap(key, center) {
  const script = document.createElement('script');
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
  script.onload = () => {
    kakao.maps.load(() => {
      map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 5,
      });

      new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(center.lat, center.lng),
        title: '삼성전자 DSR 사업장 기준점',
      });
    });
  };
  document.head.appendChild(script);
}

async function init() {
  const configResponse = await fetch('/api/config');
  const config = await configResponse.json();

  Object.entries(config.availableMenus).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    menuSelect.appendChild(option);
  });

  if (!config.mapAppKey) {
    document.getElementById('map').innerHTML =
      '<p style="padding:16px;">KAKAO_JAVASCRIPT_KEY가 없어 지도를 불러올 수 없습니다.</p>';
    return;
  }

  loadKakaoMap(config.mapAppKey, config.dsrCenter);
}

searchButton.addEventListener('click', fetchPlaces);

init();
