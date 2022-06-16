# nodejs-wallet
Repo for NodeJS wallet task

This project is a Web Wallet made via NodeJS. The wallet is to enable money transfer functionality between users signed up on the platform that I've called 'Sigma Wallet'.

Features of Sigma Wallet-

1) Users can signup and create an account at /auth/signup [PUT]. A wallet balance of INR 1000 is provided and a confirmation mail is sent to the registered email ID upon successful signup.
2) Users can login to their account at /auth/signup [POST]. If user enters an incorrect password, an OTP is registered and sent via email.
3) In case of OTP login, users can do so at /auth/otp [POST] by entering the above OTP.
4) All user sessions are maintained with JWT token, which once set needs to be added to 'Authorization' header as 'Bearer < token >'

5) Developers can set any user account as an admin account by changing the 'isAdmin' field as true in the MongoDB User model of a partcicular user. By default, all users signing up are not admins i.e 'isAdmin': false.
6) Admin accounts, once logged in, can:
   i)   Review transactions of other users by referencing their userId at /admin/transactions [GET]
   ii)  Check an account's status whether it is activated or deactivated at /admin/accounts [GET]
   iii) Activate or deactivate a user account by flipping the account status at /admin/accounts/manage [POST]
   
7) Users can send money to other users provided they have their userId at /pay [POST]
8) Users can add money to their wallet at /add-money [POST]
9) Users can see their transaction history at /transactions [GET]
10) Users can download an invoice file of their transactions (invoice.txt in data/invoice.txt) at /invoice [GET]
