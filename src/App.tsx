import './App.css';
import { useState, useEffect } from 'react';
import getPrefData from './components/prefAPI';
import getPopData from './components/popAPI';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);

type PrefData = {
  prefCode: number;
  prefName: string;
};

const App: React.FC = () => {
  const [prefectures, setPrefectures] = useState<PrefData[]>([]);
  const [checkedPrefCodes, setCheckedPrefCodes] = useState<number[]>(
    []
  );
  const [loadedPrefData, setLoadedPrefData] = useState(
    new Map<number, number[]>()
  );

  const graphData: { data: number[]; name: string }[] =
    checkedPrefCodes
      .map((code) =>
        prefectures.find((pref) => pref.prefCode === code)
      )
      .filter(
        (pref) =>
          pref !== undefined && loadedPrefData.has(pref.prefCode)
      )
      .map((pref) => ({
        name: pref!.prefName,
        data: [...loadedPrefData.get(pref!.prefCode)!],
      }));

  const options = {
    chart: {
      type: 'spline',
      backgroundColor: '#ffcb9a',
      polar: true,
    },
    title: {
      text: '人口構成',
      style: {
        color: '#076537',
      },
    },
    lang: {
      noData: 'データがありません',
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#303030',
      },
    },
    xAxis: {
      categories: [
        '1960',
        '1965',
        '1970',
        '1975',
        '1980',
        '1985',
        '1990',
        '1995',
        '2000',
        '2005',
        '2010',
        '2015',
        '2020',
        '2025',
        '2030',
        '2035',
        '2040',
        '2045',
      ],
    },
    series: graphData,
  };

  useEffect(() => {
    getPrefData.GetPref().then((data) => setPrefectures(data));
  }, []);

  const handleChange = (checked: boolean, prefCode: number) => {
    if (checked) {
      if (!checkedPrefCodes.includes(prefCode)) {
        setCheckedPrefCodes([...checkedPrefCodes, prefCode]);
      }
      if (!loadedPrefData.has(prefCode)) {
        getPopData.FetchPop(prefCode).then((res) => {
          setLoadedPrefData((oldData) => {
            const newData = new Map(oldData);
            newData.set(
              prefCode,
              res[0].data.map((item: any) => item.value)
            );
            return newData;
          });
        });
      }
    } else {
      setCheckedPrefCodes(
        checkedPrefCodes.filter((code) => code !== prefCode)
      );
    }
  };

  return (
    <div className="container">
      <h1 className="container-title">
        <span className="">都道府県</span>
      </h1>
      <div className="container-chart">
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'chart'}
          options={options}
        />
      </div>
      <div className="app-prefectures-list-container">
        {prefectures?.map((item) => {
          return (
            <label
              key={item.prefCode}
              className="app-prefectures-list"
            >
              <input
                className="app-prefectures-list-checkbox"
                type="checkbox"
                onChange={(e) =>
                  handleChange(e.target.checked, item.prefCode)
                }
              />
              <span className="app-prefectures-name">
                {item.prefName}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default App;
