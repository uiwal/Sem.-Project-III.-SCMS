set PATH=%PATH%;C:\Program Files\nodejs
cd frontend
call npm install
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p
call npm install react-router-dom axios lucide-react chart.js react-chartjs-2
