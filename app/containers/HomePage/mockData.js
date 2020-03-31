import faker from 'faker';
import moment from 'moment';

const range = len => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = () => {
  const severity = Math.random();
  const temperature = 97 + Math.random() * 5;
  const symptoms =
    temperature > 99
      ? [
        {
          label: 'cough',
          value: Math.floor(Math.random() * 9) + 1,
        },
        {
          label: 'shortness of breath',
          value: Math.floor(Math.random() * 9) + 1,
        },
      ].concat([
        {
          label: 'fever',
          value: Math.floor(Math.random() * 9) + 1,
        },
      ])
      : [
        {
          label: 'cough',
          value: Math.floor(Math.random() * 9) + 1,
        },
        {
          label: 'shortness of breath',
          value: Math.floor(Math.random() * 9) + 1,
        },
      ];
  return {
    firstName: faker.fake('{{name.firstName}}'),
    lastName: faker.fake('{{name.lastName}}'),
    temperature,
    resting_hr: 0 + Math.random() * 20,
    spo2: 80 + Math.floor(Math.random() * 20),
    status:
      temperature > 99 && severity > 0.5
        ? [{ label: 'In-patient' }]
        : [{ label: 'Out-patient' }],
    symptoms,
    notes: '',
    lastContactDate: moment(
      faker.date.between(
        moment()
          .subtract(14, 'days')
          .toDate(),
        moment().format('YYYY-MM-DD'),
      ),
    ).format('YYYY/MM/DD HH:mm:ss'),
  };
};

export default function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth];
    return range(len).map(_ => ({
      ...newPerson(),
      subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
    }));
  };

  return makeDataLevel();
}
