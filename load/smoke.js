// Post-deploy smoke test: a few users for 20 seconds, must stay fast and error-free.
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  check(http.get(`${BASE_URL}/health/ready`), { 'ready': (r) => r.status === 200 });
  check(http.get(`${BASE_URL}/api/search?q=Jollof`), { 'search ok': (r) => r.status === 200 });
}
