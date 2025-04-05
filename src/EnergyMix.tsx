import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './EnergyMix.css';

type FuelType =
  | 'biomass'
  | 'coal'
  | 'imports'
  | 'gas'
  | 'nuclear'
  | 'other'
  | 'hydro'
  | 'solar'
  | 'wind';

interface FuelSource {
  fuel: FuelType;
  perc: number;
}

interface EnergyData {
  from: string;
  to: string;
  generationmix: FuelSource[];
}

const DEFAULT_DATA: EnergyData = {
  from: new Date().toISOString(),
  to: new Date().toISOString(),
  generationmix: [],
};

const FUEL_COLORS: Record<FuelType, string> = {
  biomass: '#5d9e5d',
  coal: '#333333',
  imports: '#9e5d9e',
  gas: '#ff7f50',
  nuclear: '#ffd700',
  other: '#cccccc',
  hydro: '#1e90ff',
  solar: '#ffcc00',
  wind: '#66b3cc',
};

const API_URL = 'https://api.carbonintensity.org.uk/generation';

const EnergyMix: React.FC = () => {
  const [data, setData] = useState<EnergyData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ data: EnergyData }>(API_URL);

        if (!response.data?.data?.generationmix) {
          throw new Error('Invalid data structure from API');
        }

        if (response.data.data.generationmix.length === 0) {
          throw new Error('No energy data available');
        }

        setData(response.data.data);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? `Network error: ${err.message}`
            : err instanceof Error
            ? err.message
            : 'Failed to load energy data',
        );
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedMix = useMemo(
    () => [...data.generationmix].sort((a, b) => b.perc - a.perc),
    [data.generationmix],
  );

  const totalPercentage = useMemo(
    () => sortedMix.reduce((sum, source) => sum + source.perc, 0),
    [sortedMix],
  );

  if (isLoading) return <div className="loading">Loading energy data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (data.generationmix.length === 0)
    return <div className="error">No energy data available</div>;

  return (
    <div className="energy-mix-container">
      <h2>UK Energy Generation Mix</h2>
      <div className="time-range">
        {new Date(data.from).toLocaleString()} -{' '}
        {new Date(data.to).toLocaleString()}
      </div>

      {totalPercentage > 0 && (
        <div className="total-percentage">
          Total: {totalPercentage.toFixed(1)}% (may not sum to 100 due to
          rounding)
        </div>
      )}

      <div className="bar-chart">
        {sortedMix.map((source) => (
          <div key={source.fuel} className="bar-container">
            <div className="bar-label">
              <span className="fuel-name">{source.fuel}</span>
              <span className="fuel-perc">{source.perc.toFixed(1)}%</span>
            </div>
            <div
              className="bar"
              style={{
                width: `${source.perc}%`,
                backgroundColor: FUEL_COLORS[source.fuel],
              }}
              aria-label={`${source.fuel}: ${source.perc}%`}
            />
          </div>
        ))}
      </div>

      <div className="legend">
        {sortedMix.map((source) => (
          <div key={source.fuel} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: FUEL_COLORS[source.fuel] }}
              aria-hidden="true"
            />
            <span>
              {source.fuel.charAt(0).toUpperCase() + source.fuel.slice(1)} (
              {source.perc.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyMix;
