# Backend Tests

This directory contains backend tests for the FastAPI application in `src/app.py`.

## Run tests

Install dependencies and run pytest from the repository root:

```bash
pip install -r requirements.txt
pytest
```

## Test structure

- `tests/conftest.py`: shared pytest fixtures for resetting in-memory state and creating a `TestClient`
- `tests/test_app.py`: API tests using the Arrange-Act-Assert (AAA) pattern

## What is covered

- `GET /activities`
- `GET /` redirect to `/static/index.html`
- `POST /activities/{activity_name}/signup`
- `DELETE /activities/{activity_name}/participants`

## Notes

- The tests rely on `pytest` discovery from the repo root and the existing `pytest.ini` configuration.
- In-memory `activities` state is reset automatically between tests to keep each case isolated.
