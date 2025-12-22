#!/bin/bash
# Quick check job result
ssh root@185.193.126.13 "curl -s 'http://localhost:3002/api/civic/llm-chat/result/19f9f181-b1d7-491e-bb1b-a777990e7e09' | jq '.result | {response: (.response | .[0:300]), sourceCount: (.sources | length), sources: (.sources[] | {title, relevanceScore}) }'"
