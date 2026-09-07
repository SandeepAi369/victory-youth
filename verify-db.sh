#!/bin/bash
# Direct database verification using CockroachDB API
API_KEY="***REMOVED***"
CLUSTER_ID="***REMOVED***"

echo "🔍 Verifying CockroachDB Connection via API..."
echo ""

# Test 1: List tables
echo "📊 TEST 1: Listing tables in database..."
curl -s --request POST \
  "https://cockroachlabs.cloud/api/v1/sql" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"cluster_id\": \"$CLUSTER_ID\",
    \"database\": \"defaultdb\",
    \"sql\": \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\"
  }" 2>&1 | head -50

echo ""
echo "✅ Database verification complete!"
