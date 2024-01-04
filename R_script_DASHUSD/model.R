
library(data.table)
folder = "~/trading-bot-test/trading-bot/R_script_DASHUSD"
setwd(folder)
# reading csv data into R environment
cryptodata = data.table(read.csv("DASHUSD_data.csv", sep=","))
userdata = data.table(read.csv("user_data.csv", sep=","))
# userdata
# creditdata
# str(creditdata)
# Traditional Credit Scoring in R
probit_all=glm(DeltaCoin~., data=cryptodata,family=binomial(link = "probit"))
# summary(probit_all)

#Predict
userdata[, c("predict", "se")] = predict(probit_all, userdata, type = "response", se.fit=TRUE)[-3]
subset(userdata, select=c("DeltaCoin", "predict"))
result_dataframe <- subset(userdata, select = c("DeltaCoin", "predict"))
range(userdata$predict)

# Marginal effects
pdf = mean(dnorm(predict(probit_all, type = "link")))
marginal.effects = pdf*coef(probit_all)
marginal.effects

# R-squared
probit_intercept=glm(DeltaCoin~1, data=cryptodata,family=binomial(link = "probit"))
logLik(probit_intercept)
logLik(probit_all)
MC_F_R2 = 1 -  as.numeric(logLik(probit_all))[1]/ as.numeric(logLik(probit_intercept))[1]
MC_F_R2 * 100