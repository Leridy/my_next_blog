// components/WeatherForecast.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCloud, FiSun, FiCloudRain, FiWind, FiDroplet, FiThermometer, FiSunrise, FiSunset, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { WiDayCloudy, WiNightCloudy, WiDayRain, WiNightRain, WiDaySnow, WiNightSnow, WiDaySunny, WiNightClear, WiThunderstorm, WiFog } from 'react-icons/wi';
import { Spin, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// 类型定义
interface WeatherData {
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
  };
  daily: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: number;
    pop: number;
    uvi: number;
  }[];
  timezone: string;
  timezone_offset: number;
}

interface GeoData {
  latitude: number;
  longitude: number;
  city: string;
  province: string;
}

// 天气描述映射表
const weatherDescriptions: Record<string, string> = {
  clear: '晴',
  'clear sky': '晴朗',
  'few clouds': '少云',
  'scattered clouds': '多云',
  'broken clouds': '阴',
  'overcast clouds': '阴天',
  'light rain': '小雨',
  'moderate rain': '中雨',
  'heavy intensity rain': '大雨',
  'very heavy rain': '暴雨',
  thunderstorm: '雷雨',
  snow: '雪',
  'light snow': '小雪',
  mist: '雾',
  fog: '雾',
  haze: '霾',
  'shower rain': '阵雨',
  rain: '雨',
  clouds: '多云',
};

const WeatherForecast: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(0);

  useEffect(() => {
    const fetchGeoAndWeather = async () => {
      try {
        setLoading(true);

        // 获取地理位置信息 - 使用高德地图API
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('您的浏览器不支持地理位置功能'));
            return;
          }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;

        // 使用高德地图API进行逆地理编码
        const geoResponse = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=553e8829d9e0f61d184830bf50106138&location=${longitude},${latitude}&extensions=base`);
        const geoResult = await geoResponse.json();

        if (geoResult.status !== '1') {
          throw new Error('无法获取位置信息');
        }

        const addressComponent = geoResult.regeocode.addressComponent;
        setGeoData({
          latitude,
          longitude,
          city: addressComponent.city || addressComponent.district || '未知城市',
          province: addressComponent.province || '未知省份',
        });

        // 使用和风天气API获取天气数据
        const weatherResponse = await fetch(`https://devapi.qweather.com/v7/weather/7d?key=f865dfcb5a8c47c5be19f2081355e64e&location=${longitude},${latitude}`);

        const nowWeatherResponse = await fetch(`https://devapi.qweather.com/v7/weather/now?key=f865dfcb5a8c47c5be19f2081355e64e&location=${longitude},${latitude}`);

        if (!weatherResponse.ok || !nowWeatherResponse.ok) {
          throw new Error('天气数据获取失败');
        }

        const dailyWeatherData = await weatherResponse.json();
        const nowWeatherData = await nowWeatherResponse.json();

        if (dailyWeatherData.code !== '200' || nowWeatherData.code !== '200') {
          throw new Error(`天气数据获取失败: ${dailyWeatherData.code}`);
        }

        // 转换和风天气数据格式为我们使用的格式
        const currentTime = Math.floor(Date.now() / 1000);
        const sunrise = Math.floor(new Date(`${dailyWeatherData.daily[0].fxDate} ${dailyWeatherData.daily[0].sunrise}`).getTime() / 1000);
        const sunset = Math.floor(new Date(`${dailyWeatherData.daily[0].fxDate} ${dailyWeatherData.daily[0].sunset}`).getTime() / 1000);

        // 构建与之前API兼容的数据结构
        const formattedData: WeatherData = {
          current: {
            dt: currentTime,
            sunrise,
            sunset,
            temp: parseFloat(nowWeatherData.now.temp),
            feels_like: parseFloat(nowWeatherData.now.feelsLike),
            pressure: parseFloat(nowWeatherData.now.pressure),
            humidity: parseFloat(nowWeatherData.now.humidity),
            dew_point: 0, // 和风天气无此数据
            uvi: 0, // 当前接口无此数据，可以通过额外接口获取
            clouds: parseInt(nowWeatherData.now.cloud || '0'),
            visibility: parseFloat(nowWeatherData.now.vis),
            wind_speed: parseFloat(nowWeatherData.now.windSpeed),
            wind_deg: parseFloat(nowWeatherData.now.wind360),
            weather: [
              {
                id: parseInt(nowWeatherData.now.icon),
                main: nowWeatherData.now.text,
                description: nowWeatherData.now.text,
                icon: nowWeatherData.now.icon,
              },
            ],
          },
          daily: dailyWeatherData.daily.map(
            (day: {
              fxDate: string | number | Date;
              sunrise: any;
              sunset: any;
              tempDay: string;
              tempMin: string;
              tempMax: string;
              tempNight: string;
              pressure: string;
              humidity: string;
              windSpeed: string;
              wind360: string;
              iconDay: string;
              textDay: any;
              precip: string;
            }) => ({
              dt: Math.floor(new Date(day.fxDate).getTime() / 1000),
              sunrise: Math.floor(new Date(`${day.fxDate} ${day.sunrise}`).getTime() / 1000),
              sunset: Math.floor(new Date(`${day.fxDate} ${day.sunset}`).getTime() / 1000),
              temp: {
                day: parseFloat(day.tempDay),
                min: parseFloat(day.tempMin),
                max: parseFloat(day.tempMax),
                night: parseFloat(day.tempNight),
                eve: (parseFloat(day.tempDay) + parseFloat(day.tempNight)) / 2,
                morn: parseFloat(day.tempDay),
              },
              feels_like: {
                day: parseFloat(day.tempDay),
                night: parseFloat(day.tempNight),
                eve: (parseFloat(day.tempDay) + parseFloat(day.tempNight)) / 2,
                morn: parseFloat(day.tempDay),
              },
              pressure: parseFloat(day.pressure),
              humidity: parseFloat(day.humidity),
              dew_point: 0,
              wind_speed: parseFloat(day.windSpeed),
              wind_deg: parseFloat(day.wind360),
              weather: [
                {
                  id: parseInt(day.iconDay),
                  main: day.textDay,
                  description: day.textDay,
                  icon: day.iconDay,
                },
              ],
              clouds: 0,
              pop: parseFloat(day.precip) / 100,
              uvi: 0,
            })
          ),
          timezone: 'Asia/Shanghai',
          timezone_offset: 28800,
        };

        setWeather(formattedData);
      } catch (err) {
        console.error('数据获取错误:', err);
        setError('无法加载天气数据，请稍后再试。');
      } finally {
        setLoading(false);
      }
    };

    fetchGeoAndWeather();
  }, []);

  // 获取天气图标
  const getWeatherIcon = (iconId: string, size: number = 24, isNight: boolean = false) => {
    const iconStyle = { fontSize: size };
    const iconNum = parseInt(iconId);

    // 根据和风天气的图标代码确定天气状况
    if (iconNum >= 100 && iconNum <= 103) {
      return isNight ? <WiNightClear style={iconStyle} /> : <WiDaySunny style={iconStyle} />;
    } else if (iconNum >= 104 && iconNum <= 204) {
      return isNight ? <WiNightCloudy style={iconStyle} /> : <WiDayCloudy style={iconStyle} />;
    } else if ((iconNum >= 300 && iconNum <= 399) || (iconNum >= 404 && iconNum <= 499)) {
      return isNight ? <WiNightRain style={iconStyle} /> : <WiDayRain style={iconStyle} />;
    } else if (iconNum >= 500 && iconNum <= 599) {
      return isNight ? <WiNightSnow style={iconStyle} /> : <WiDaySnow style={iconStyle} />;
    } else if (iconNum >= 200 && iconNum <= 299) {
      return <WiThunderstorm style={iconStyle} />;
    } else if (iconNum >= 700 && iconNum <= 799) {
      return <WiFog style={iconStyle} />;
    } else {
      return <FiCloud style={iconStyle} />;
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('zh-CN', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  };

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 获取风向描述
  const getWindDirection = (degrees: number): string => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
  };

  // 获取UV指数描述和颜色
  const getUVIndexInfo = (uvi: number) => {
    if (uvi <= 2) return { level: '低', color: 'text-green-500' };
    if (uvi <= 5) return { level: '中等', color: 'text-yellow-500' };
    if (uvi <= 7) return { level: '高', color: 'text-orange-500' };
    if (uvi <= 10) return { level: '很高', color: 'text-red-500' };
    return { level: '极高', color: 'text-purple-600' };
  };

  // 翻译天气描述
  const translateWeatherDescription = (desc: string): string => {
    const lowerDesc = desc.toLowerCase();
    for (const [key, value] of Object.entries(weatherDescriptions)) {
      if (lowerDesc.includes(key)) {
        return value;
      }
    }
    return desc; // 如果没有找到匹配的描述，返回原始描述
  };

  // 检查是否为晚上
  const isNight = (current: number, sunrise: number, sunset: number): boolean => {
    return current < sunrise || current > sunset;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-[var(--color-background)] rounded-xl shadow-md">
        <Spin
          indicator={
            <LoadingOutlined
              style={{ fontSize: 36 }}
              spin
            />
          }
          tip="加载天气数据中..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-[var(--color-background)] rounded-xl shadow-md text-[var(--color-text)]">
        <div className="text-center p-4">
          <FiCloud className="mx-auto text-5xl mb-3 text-[var(--color-text-secondary)]" />
          <p className="text-lg font-semibold">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!weather || !geoData) {
    return null;
  }

  const current = weather.current;
  const dailyForecast = weather.daily;
  const currentIsNight = isNight(current.dt, current.sunrise, current.sunset);
  const weatherMain = translateWeatherDescription(current.weather[0]?.description);
  const currentUVInfo = getUVIndexInfo(current.uvi);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--color-background)] rounded-xl shadow-lg overflow-hidden">
      {/* 顶部卡片：当天天气 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 relative"
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* 左侧：位置和当前天气 */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <h1 className="text-xl font-bold text-[var(--color-text)]">{geoData.city}</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-[var(--color-text-secondary)]"
            >
              {formatDate(current.dt)}
            </motion.div>

            <div className="flex items-center mt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl mr-5"
              >
                {getWeatherIcon(current.weather[0].icon, 60, currentIsNight)}
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-semibold text-[var(--color-text)]"
                >
                  {Math.round(current.temp)}°
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-[var(--color-text-secondary)] mt-1"
                >
                  {weatherMain}
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center mt-3 text-[var(--color-text-secondary)]"
            >
              <div className="flex items-center mr-4">
                <FiArrowUp className="mr-1" />
                <span>{Math.round(dailyForecast[0].temp.max)}°</span>
              </div>
              <div className="flex items-center">
                <FiArrowDown className="mr-1" />
                <span>{Math.round(dailyForecast[0].temp.min)}°</span>
              </div>
            </motion.div>
          </div>

          {/* 右侧：详细信息 */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="md:w-1/2 bg-[var(--color-card-background)] p-3 rounded-xl"
          >
            <h3 className="text-base font-semibold mb-2 text-[var(--color-text)]">今日详情</h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-[var(--color-text)]">
                <FiThermometer className="mr-2" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">体感温度</div>
                  <div>{Math.round(current.feels_like)}°</div>
                </div>
              </div>

              <div className="flex items-center text-[var(--color-text)]">
                <FiDroplet className="mr-2" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">湿度</div>
                  <div>{current.humidity}%</div>
                </div>
              </div>

              <div className="flex items-center text-[var(--color-text)]">
                <FiWind className="mr-2" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">风速</div>
                  <div>
                    {Math.round(current.wind_speed)} km/h {getWindDirection(current.wind_deg)}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-[var(--color-text)]">
                <FiSun className="mr-2" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">紫外线</div>
                  <div className={currentUVInfo.color}>
                    {current.uvi} ({currentUVInfo.level})
                  </div>
                </div>
              </div>

              <div className="flex items-center text-[var(--color-text)]">
                <FiSunrise className="mr-2" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">日出</div>
                  <div>{formatTime(current.sunrise)}</div>
                </div>
              </div>

              <div className="flex items-center text-[var(--color-text)]">
                <FiSunset className="mr-2" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">日落</div>
                  <div>{formatTime(current.sunset)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 7天预报 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="p-4 bg-[var(--color-quaternary)] rounded-t-3xl mt-2"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text)]">七日预报</h3>

        <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
          {dailyForecast.slice(0, 7).map((day, index) => (
            <motion.div
              key={day.dt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-[var(--color-transparent-background)] rounded-lg p-2 cursor-pointer 
                ${index === activeDay ? 'ring-2 ring-[var(--color-tertiary)]' : ''}`}
              onClick={() => setActiveDay(index)}
            >
              <div className="text-center text-sm">
                <div className="font-medium text-[var(--color-text)]">{index === 0 ? '今天' : index === 1 ? '明天' : formatDate(day.dt).split(' ')[0]}</div>

                <div className="my-2 flex justify-center">{getWeatherIcon(day.weather[0].icon, 30, isNight(day.dt, day.sunrise, day.sunset))}</div>

                <div className="flex justify-center text-[var(--color-text)] text-xs gap-2">
                  <span className="font-medium">{Math.round(day.temp.max)}°</span>
                  <span className="text-[var(--color-text-secondary)]">{Math.round(day.temp.min)}°</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 bg-[var(--color-transparent-background)] rounded-lg p-3 overflow-hidden"
          >
            <h4 className="text-base font-medium text-[var(--color-text)] mb-2">{activeDay === 0 ? '今天' : activeDay === 1 ? '明天' : formatDate(dailyForecast[activeDay].dt)}</h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Tooltip title="早晨温度">
                <div className="flex items-center text-[var(--color-text)]">
                  <WiDaySunny className="text-xl mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">早晨</div>
                    <div>{Math.round(dailyForecast[activeDay].temp.morn)}°</div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="白天温度">
                <div className="flex items-center text-[var(--color-text)]">
                  <FiSun className="mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">白天</div>
                    <div>{Math.round(dailyForecast[activeDay].temp.day)}°</div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="傍晚温度">
                <div className="flex items-center text-[var(--color-text)]">
                  <WiDayCloudy className="text-xl mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">傍晚</div>
                    <div>{Math.round(dailyForecast[activeDay].temp.eve)}°</div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="夜间温度">
                <div className="flex items-center text-[var(--color-text)]">
                  <WiNightClear className="text-xl mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">夜间</div>
                    <div>{Math.round(dailyForecast[activeDay].temp.night)}°</div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="降水概率">
                <div className="flex items-center text-[var(--color-text)]">
                  <FiCloudRain className="mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">降水</div>
                    <div>{Math.round(dailyForecast[activeDay].pop * 100)}%</div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="紫外线指数">
                <div className="flex items-center text-[var(--color-text)]">
                  <FiSun className="mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">紫外线</div>
                    <div className={getUVIndexInfo(dailyForecast[activeDay].uvi).color}>
                      {dailyForecast[activeDay].uvi} ({getUVIndexInfo(dailyForecast[activeDay].uvi).level})
                    </div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="风速和风向">
                <div className="flex items-center text-[var(--color-text)]">
                  <FiWind className="mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">风速</div>
                    <div>
                      {Math.round(dailyForecast[activeDay].wind_speed)} km/h {getWindDirection(dailyForecast[activeDay].wind_deg)}
                    </div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="湿度">
                <div className="flex items-center text-[var(--color-text)]">
                  <FiDroplet className="mr-2" />
                  <div>
                    <div className="text-xs text-[var(--color-text-secondary)]">湿度</div>
                    <div>{dailyForecast[activeDay].humidity}%</div>
                  </div>
                </div>
              </Tooltip>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WeatherForecast;
