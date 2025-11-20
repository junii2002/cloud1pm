import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import "./EmotionReportPage.css";
import { getEmotionTrend } from "../api/chatApi";

const EmotionReportPage = () => {
  const [period, setPeriod] = useState("week");
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmotionTrend();
  }, [period]);

  const fetchEmotionTrend = async () => {
    setLoading(true);
    setError(null);

    try {
      const days = period === "week" ? 7 : 30;
      const response = await getEmotionTrend(days);

      const trendList = response.trends ?? [];

      const formattedData = trendList.map((item) => ({
        date: formatDate(item.date),
        score: normalizeScore(
          item.averageSentimentScore ??
            item.averageScore ??
            item.score ??
            0
        ),
      }));

      setEmotionData(formattedData);
    } catch (err) {
      console.error("감정 트렌드 조회 실패:", err);
      setError("감정 데이터를 불러오는데 실패했습니다.");
      setEmotionData(generateMockData(period));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  const generateMockData = (periodType) => {
    const days = periodType === "week" ? 7 : 30;
    const today = new Date();
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: formatDate(date),
        score: Number((Math.random() * 2 - 1).toFixed(2)), // -1~1 랜덤
      });
    }
    return data;
  };

  // ✔ 감정 점수는 백엔드의 -1.0 ~ 1.0 스케일 그대로 사용
  const normalizeScore = (value) => {
  if (value === null || value === undefined) return 0;
  return Number(value) * 10;   // -1~1 → -10~10 변환
};


  return (
    <div className="emotion-report-container">
      {/* 헤더 */}
      <div className="report-header">
        <h1 className="report-title">감정 변화 추이</h1>
        <p className="report-subtitle">
          지난 {period === "week" ? "일주일" : "한 달"} 간, 감정의 흐름이 이렇게 움직였어요
        </p>
      </div>

      {/* 기간 선택 */}
      <div className="period-tabs">
        <button
          className={`period-tab ${period === "week" ? "active" : ""}`}
          onClick={() => setPeriod("week")}
        >
          최근 7일
        </button>
        <button
          className={`period-tab ${period === "month" ? "active" : ""}`}
          onClick={() => setPeriod("month")}
        >
          한 달
        </button>
      </div>

      <div className="emotion-info-simple">
  <p>📘 <strong>감정 점수 안내</strong></p>
  <p>감정 점수는 -10에서 +10 사이로 표현돼요.</p>
  <p>0을 기준으로 위는 긍정☺️, 아래는 부정😞 감정을 의미해요. </p>
  <p className="emotion-tip">
    힘든 날이 있더라도 괜찮아요. 오늘을 되돌아보고 내가 설정한 작은 활동 하나만 실천해볼까요?
  </p>
</div>


      {/* 차트 */}
      <div className="chart-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>감정 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchEmotionTrend}>
              다시 시도
            </button>
          </div>
        ) : emotionData.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">아직 감정 데이터가 없어요</p>
            <p className="empty-description">
              채팅을 통해 감정을 기록하면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={emotionData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />

              {/* ✔ 음수 포함 domain */}
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                domain={["auto", "auto"]}
                allowDataOverflow={true}
              />

              {/* ✔ 0 기준선 추가 */}
              <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                formatter={(value) => [`${value}`, "감정 점수"]}
              />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EmotionReportPage;
