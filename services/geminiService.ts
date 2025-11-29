import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SeTeukInput, SeTeukResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 core keywords representing the student",
        },
        strengths: {
          type: Type.STRING,
          description: "Summary of observed strengths",
        },
        storyline: {
          type: Type.STRING,
          description: "Brief explanation of the writing flow/narrative",
        },
      },
      required: ["keywords", "strengths", "storyline"],
    },
    draft: {
      type: Type.STRING,
      description: "The complete Student Record (SeTeuk) draft text.",
    },
  },
  required: ["analysis", "draft"],
};

export const generateSeTeuk = async (input: SeTeukInput): Promise<SeTeukResult> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    당신은 10년 차 이상의 베테랑 교사이자 대학 입학사정관 출신의 교과세특(세부능력 및 특기사항) 전문 작성 AI입니다.
    교사가 제공하는 파편화된 학생의 활동 자료(텍스트 및 업로드된 파일)와 관찰 평가를 종합하여, 학생의 역량이 드러나는 하나의 완결된 스토리를 구축하고 이를 생기부 규정에 맞게 작성하십시오.

    [필수 준수 사항 - 작성 규칙]
    1. 분량: UTF-8 기준 1500바이트(한글 약 500자) 이내로 작성하십시오.
    2. 서술 방식 (문체 엄수):
       - 종결 어미는 반드시 명사형('~임', '~함')으로 끝내십시오. (예: 우수한 성과를 보임, 결론을 도출함)
       - 시제는 '현재형'으로 작성하십시오. (예: 효과적이었음(X) -> 효과적임(O), 활동했음(X) -> 활동함(O))
       - 주어(학생, 본인 등)는 철저히 생략하십시오.
       - 접속사(그리고, 그러나, 또한 등) 사용을 지양하고 문맥으로 자연스럽게 연결하십시오.
    3. 내용 구성:
       - 교사의 총평을 중요하게 반영하되 그대로 베끼지 말고, 활동 증거와 연결하여 구체화하십시오.
       - 교과 특성에 맞는 핵심 역량을 중심으로 서술하십시오.
       - 미사여구(탁월함, 뛰어남)나 추측성 표현(~할 것으로 기대됨)을 배제하고, '무엇을 어떻게 했는지' 팩트와 근거 위주로 작성하여 객관성을 확보하십시오.
       - 부정적 표현을 피하고 학생의 성장이 드러나도록 긍정적으로 기술하십시오.
    4. 표기법:
       - 참고 문헌(책, 논문 등) 언급 시 반드시 '도서명(저자)' 형식을 지키십시오. (예: '이기적 유전자(리처드 도킨스)')
       - 학생의 실명 등 개인정보는 포함하지 마십시오.
    5. 권장 서술어 (다음 어휘를 적극 활용):
       - 질문함, 정의함, 진단함, 해석함, 도출함, 재구성함, 분석함, 탐구함, 비교함, 예측함, 평가함, 설정함, 의견을 공유함, 공감을 끌어냄, 토의함, 제안함, 설명함, 발표함, 섭외함, 기획함, 제작함, 변환함, 구성함, 설계함, 실행함, 실험함, 반성함, 심화 학습함, 다짐함 등.

    [사고 과정]
    1. 자료 분석: 동기 -> 과정(구체적 행동) -> 결과 -> 심화/확장 흐름 파악.
    2. 교사 평가 연결: 교사의 코멘트를 입증할 수 있는 구체적 활동 사례 매칭.
    3. 작성 및 검토: 위 '필수 준수 사항'의 문체 규칙(명사형 종결, 현재형, 주어 생략)이 적용되었는지 확인.
  `;

  // Construct parts for the model
  const parts: any[] = [];
  let appendedFileText = "";

  // 1. Add uploaded files
  if (input.files && input.files.length > 0) {
    input.files.forEach((file) => {
      // Check for text files (or generic octet-stream that might be text, but safer to check mime or rely on txt extension in logic if needed, here we check mime)
      if (file.mimeType.includes("text") || file.name.endsWith(".txt")) {
        try {
          // Decode base64 to text string for the model to read directly
          const binaryString = atob(file.data);
          // Convert binary string to UTF-8
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const textContent = new TextDecoder().decode(bytes);
          
          appendedFileText += `\n[업로드된 텍스트 파일 내용: ${file.name}]\n${textContent}\n-------------------\n`;
        } catch (e) {
          console.error("Failed to decode text file:", e);
          // Fallback if decoding fails (though usually shouldn't for simple base64)
          parts.push({
            inlineData: {
              data: file.data,
              mimeType: "text/plain",
            },
          });
        }
      } else {
        // Handle as binary media (Image, PDF, Audio)
        parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType,
          },
        });
      }
    });
  }

  // 2. Add text prompts
  const userPrompt = `
    다음 학생 자료를 바탕으로 생기부 세특을 작성해줘.

    [학생 활동 자료 (텍스트)]
    ${input.activityData || "(텍스트 자료 없음, 첨부파일 참고)"}

    ${appendedFileText ? `[추가 첨부 텍스트 파일 내용]\n${appendedFileText}` : ""}

    [교사 평가/코멘트]
    ${input.teacherComments || "(평가 코멘트 없음)"}

    [옵션]
    - 희망 분량: ${input.lengthOption}
    - 강조하고 싶은 역량 키워드: ${input.emphasisKeywords.join(", ") || "종합적 역량"}
    
    [작성 시 강력 규제 사항]
    1. 문장은 반드시 '~음', '~함' 등의 명사형으로 종결할 것. (평서문 절대 금지)
    2. 시제는 현재형을 사용할 것. (~했음 X -> ~함 O)
    3. 주어(학생 등)는 생략할 것.
    4. 도서 인용 시 '도서명(저자)' 형식을 반드시 갖출 것.
    
    첨부된 파일(이미지, PDF, 오디오 등)이 있다면 해당 내용도 상세히 분석하여 생기부 내용에 반영해줘.
  `;

  parts.push({ text: userPrompt });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.6,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SeTeukResult;
    } else {
      throw new Error("No response text generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};