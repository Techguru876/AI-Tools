import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

interface CostSummary {
  total_cost: number;
  costs_by_service: Record<string, number>;
  costs_by_day: Array<{ date: string; cost: number }>;
  costs_by_operation: Record<string, number>;
}

interface PerformanceStats {
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  average_duration_ms: number;
  cache_hit_rate: number;
  operations_by_type: Record<string, number>;
  operations_by_day: Array<{ date: string; count: number }>;
}

interface GenerationStats {
  total_scripts: number;
  total_voice_files: number;
  total_images: number;
  total_videos: number;
  total_uploads: number;
  success_rate: number;
  average_script_length: number;
  average_video_duration: number;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [generationStats, setGenerationStats] = useState<GenerationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const startDate = getStartDateForRange(timeRange);
      const endDate = Date.now();

      // In production, these would be actual API calls
      // For now, we'll use placeholder data
      const costs: CostSummary = {
        total_cost: 125.50,
        costs_by_service: {
          openai: 85.30,
          elevenlabs: 32.20,
          youtube: 8.00,
        },
        costs_by_day: generateMockDailyData(timeRange),
        costs_by_operation: {
          'script_generation': 45.20,
          'voice_generation': 32.20,
          'image_generation': 40.10,
          'metadata_generation': 8.00,
        },
      };

      const performance: PerformanceStats = {
        total_operations: 1250,
        successful_operations: 1187,
        failed_operations: 63,
        average_duration_ms: 3200,
        cache_hit_rate: 0.68,
        operations_by_type: {
          'script_generation': 320,
          'voice_generation': 298,
          'image_generation': 412,
          'video_render': 145,
          'youtube_upload': 75,
        },
        operations_by_day: generateMockActivityData(timeRange),
      };

      const generation: GenerationStats = {
        total_scripts: 320,
        total_voice_files: 298,
        total_images: 412,
        total_videos: 145,
        total_uploads: 75,
        success_rate: 94.96,
        average_script_length: 850,
        average_video_duration: 180,
      };

      setCostSummary(costs);
      setPerformanceStats(performance);
      setGenerationStats(generation);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDateForRange = (range: TimeRange): number => {
    const now = Date.now();
    switch (range) {
      case '7d': return now - (7 * 24 * 60 * 60 * 1000);
      case '30d': return now - (30 * 24 * 60 * 60 * 1000);
      case '90d': return now - (90 * 24 * 60 * 60 * 1000);
      case 'all': return 0;
    }
  };

  const generateMockDailyData = (range: TimeRange): Array<{ date: string; cost: number }> => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data: Array<{ date: string; cost: number }> = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        cost: Math.random() * 10 + 2,
      });
    }

    return data.reverse();
  };

  const generateMockActivityData = (range: TimeRange): Array<{ date: string; count: number }> => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data: Array<{ date: string; count: number }> = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10,
      });
    }

    return data.reverse();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Costs</div>
            <div className="card-value">{formatCurrency(costSummary?.total_cost || 0)}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Total Operations</div>
            <div className="card-value">{performanceStats?.total_operations || 0}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-label">Success Rate</div>
            <div className="card-value">{formatPercent((generationStats?.success_rate || 0) / 100)}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <div className="card-label">Cache Hit Rate</div>
            <div className="card-value">{formatPercent(performanceStats?.cache_hit_rate || 0)}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Cost Chart */}
        <div className="chart-card">
          <h3>Daily Costs</h3>
          <div className="simple-chart">
            {costSummary?.costs_by_day.slice(-14).map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{ height: `${(day.cost / 15) * 100}%` }}
                  title={`${day.date}: ${formatCurrency(day.cost)}`}
                />
                <div className="chart-label">{new Date(day.date).getDate()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="chart-card">
          <h3>Daily Activity</h3>
          <div className="simple-chart">
            {performanceStats?.operations_by_day.slice(-14).map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className="chart-bar activity"
                  style={{ height: `${(day.count / 70) * 100}%` }}
                  title={`${day.date}: ${day.count} operations`}
                />
                <div className="chart-label">{new Date(day.date).getDate()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="stats-grid">
        {/* Cost Breakdown */}
        <div className="stats-card">
          <h3>Cost Breakdown</h3>
          <div className="stats-list">
            {Object.entries(costSummary?.costs_by_service || {}).map(([service, cost]) => (
              <div key={service} className="stats-item">
                <span className="stats-label">{service.toUpperCase()}</span>
                <span className="stats-value">{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Breakdown */}
        <div className="stats-card">
          <h3>Operations by Type</h3>
          <div className="stats-list">
            {Object.entries(performanceStats?.operations_by_type || {}).map(([type, count]) => (
              <div key={type} className="stats-item">
                <span className="stats-label">{type.replace(/_/g, ' ')}</span>
                <span className="stats-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generation Stats */}
        <div className="stats-card">
          <h3>Content Generated</h3>
          <div className="stats-list">
            <div className="stats-item">
              <span className="stats-label">Scripts</span>
              <span className="stats-value">{generationStats?.total_scripts || 0}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Voice Files</span>
              <span className="stats-value">{generationStats?.total_voice_files || 0}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Images</span>
              <span className="stats-value">{generationStats?.total_images || 0}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Videos</span>
              <span className="stats-value">{generationStats?.total_videos || 0}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Uploads</span>
              <span className="stats-value">{generationStats?.total_uploads || 0}</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="stats-card">
          <h3>Performance</h3>
          <div className="stats-list">
            <div className="stats-item">
              <span className="stats-label">Avg. Duration</span>
              <span className="stats-value">{formatDuration(performanceStats?.average_duration_ms || 0)}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Success Rate</span>
              <span className="stats-value success">{formatPercent((generationStats?.success_rate || 0) / 100)}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Failed Ops</span>
              <span className="stats-value error">{performanceStats?.failed_operations || 0}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Cache Efficiency</span>
              <span className="stats-value">{formatPercent(performanceStats?.cache_hit_rate || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
