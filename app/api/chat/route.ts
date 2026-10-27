import { NextResponse } from 'next/server';

// Имитация базы данных университета (LMS / 1С:Университет / RAG)[cite: 1]
const MOCK_DATABASE = {
  student: {
    id: "ST-84920",
    name: "Иван Иванов",
    group: "ИТ-301",
  },
  attendance: {
    totalAbsences: 7,
    subjects: [
      { name: "Высшая математика", missedHours: 4 },
      { name: "Физика", missedHours: 2 },
      { name: "История", missedHours: 1 },
    ],
  },
  schedule: {
    today: "Четверг",
    currentPair: {
      subject: "Физика (Лабораторная)",
      room: "Кабинет 234, Корпус Б",
      time: "11:50 - 13:20",
      teacher: "Проф. Сидоров А.В.",
    },
    nextPair: {
      subject: "Программирование C++",
      room: "Кабинет 410, Главный корпус",
      time: "13:40 - 15:10",
    },
  },
  homework: [
    { subject: "Математика", task: "Решить задачи 12-18 на стр. 45 (Дифференциальные уравнения)", deadline: "До завтра, 23:59" },
    { subject: "Физика", task: "Оформить отчёт по Лабораторной №2", deadline: "До пятницы" },
  ],
  faq: [
    { key: "академ", answer: "Для оформления академического отпуска обратитесь в деканат (каб. 102) с заявлением и медицинской справкой №095/у до 15 числа." },
    { key: "оплат", answer: "Оплату за осенний семестр необходимо произвести до 1 сентября, за весенний — до 1 февраля через личный кабинет или кассу банка." },
  ]
};

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const query = (message || "").toLowerCase().trim();

    // Этап 1: NLU & Intent Recognition[cite: 1]
    let intent = "unknown";
    if (query.includes("пропуск") || query.includes("посещаем") || query.includes("оценк")) {
      intent = "attendance";
    } else if (query.includes("где") || query.includes("пара") || query.includes("кабинет") || query.includes("расписан")) {
      intent = "schedule";
    } else if (query.includes("домаш") || query.includes("дз") || query.includes("задан")) {
      intent = "homework";
    } else if (query.includes("академ") || query.includes("оплат") || query.includes("справк")) {
      intent = "faq";
    }

    // Этап 2 & 3: Database Query & Response Generation[cite: 1]
    let reply = "";
    let extractedData: any = null;

    switch (intent) {
      case "attendance":
        extractedData = MOCK_DATABASE.attendance;
        reply = `У вас зафиксировано **${MOCK_DATABASE.attendance.totalAbsences} пропусков**. \nДетали по предметам:\n` +
          MOCK_DATABASE.attendance.subjects.map(s => `• ${s.name}: ${s.missedHours} ч.`).join("\n");
        break;

      case "schedule":
        extractedData = MOCK_DATABASE.schedule;
        reply = `Сейчас идет пара по предмету **${MOCK_DATABASE.schedule.currentPair.subject}**.\n` +
          `📍 Локация: **${MOCK_DATABASE.schedule.currentPair.room}**\n` +
          `⏰ Время: ${MOCK_DATABASE.schedule.currentPair.time}\n` +
          `👨‍🏫 Преподаватель: ${MOCK_DATABASE.schedule.currentPair.teacher}`;
        break;

      case "homework":
        extractedData = MOCK_DATABASE.homework;
        reply = `Текущие домашние задания:\n` +
          MOCK_DATABASE.homework.map(h => `• **${h.subject}**: ${h.task} (${h.deadline})`).join("\n");
        break;

      case "faq":
        const foundFaq = MOCK_DATABASE.faq.find(f => query.includes(f.key));
        extractedData = foundFaq || MOCK_DATABASE.faq;
        reply = foundFaq 
          ? foundFaq.answer 
          : "Информация по административному регламенту найдена в Базе Знаний университета (RAG).";
        break;

      default:
        reply = "Извините, я не совсем понял вопрос. Спросите про посещаемость, текущую пару, домашнее задание или академический отпуск.";
        break;
    }

    return NextResponse.json({
      success: true,
      reply,
      meta: {
        intent,
        extractedData,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Ошибка обработки запроса" }, { status: 500 });
  }
}