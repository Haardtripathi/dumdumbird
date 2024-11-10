local json = require("json")

if not HIGH_SCORES then HIGH_SCORES = {} end
if not INITIALIZED then INITIALIZED = false end

Handlers.add("Initialize",
    Handlers.utils.hasMatchingTag("Action", "Initialize"),
    function(msg)
        if msg.Data then
            print("Initialize message: " .. msg.Data)
        else
            print("Initialize message received (no data)")
        end

        if not INITIALIZED then
            INITIALIZED = true

            Send({
                Target = msg.From,
                Data = json.encode({
                    status = "success",
                    message = "Game initialized"
                })
            })

            return
        end

        Send({
            Target = msg.From,
            Data = json.encode({
                status = "success",
                message = "Game already initialized"
            })
        })
    end
)

Handlers.add("SaveScore",
    Handlers.utils.hasMatchingTag("Action", "SaveScore"),
    function (msg)
        print("Processing SaveScore request")
        print("Message:", json.encode(msg))

        local score = tonumber(msg.Data)
        print("Score:", score)

        if score == nil or type(score) ~= "number" then 
            Send({
                Target = msg.From,
                Data = json.encode({
                    status = "error",
                    message = "Score not provided or invalid"
                })
            })
            return
        end
        
        if score < 0 then 
            Send({
                Target = msg.From,
                Data = json.encode({
                    status = "error",
                    message = "Invalid score value: must be non-negative"
                })
            })
            return
        end
        
        local newScore = {
            score = score,
            wallet = msg.From,
            timestamp = os.time()
        }
        
        table.insert(HIGH_SCORES, newScore)
        print("HIGH_SCORES:", json.encode(HIGH_SCORES))

        Send({
            Target = msg.From,
            Data = json.encode({
                status = "success",
                message = "Score saved successfully"
            })
        })
    end
)

Handlers.add("GetAllScores",
    Handlers.utils.hasMatchingTag("Action", "GetAllScores"),
    function (msg)
        print("Processing GetAllScores request for wallet: " .. msg.From)
        
        -- Filter scores for the current wallet
        local walletScores = {}
        for _, score in ipairs(HIGH_SCORES) do
            if score.wallet == msg.From then
                table.insert(walletScores, score)
            end
        end
        
        if #walletScores == 0 then
            Send({
                Target = msg.From,
                Data = json.encode({
                    status = "success",
                    message = "No scores available for this wallet",
                    data = {}
                })
            })
            return
        end
    
        Send({
            Target = msg.From,
            Data = json.encode({
                status = "success",
                message = "Scores retrieved successfully",
                data = walletScores
            })
        })
    end
)


return Handlers