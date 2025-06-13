import { inngest, supportAgent } from "../lib/inngest.js"; // Import Inngest client
import hospitalData from "../data/hospital.js"; // Import hospital data
import queue from "../data/queue.js"; // Import queue data
import Token from "../models/token.model.js"; // Import Token model

// Function to assign a doctor using AI
export const assignDoctor = inngest.createFunction(
  { id: "assign-doctor-ai", name: "Assign Doctor via AI" },
  { event: "ai/assign.doctor" },
  async ({ event }) => {
    try {
      const { patientId, tokenId, symptoms, department } = event.data;

      const doctors = hospitalData.doctors
        .filter(d => d.department === department)
        .map(d => ({
          ...d,
          queueSize: queue[department][d.doctorId]?.length || 0
        }));

      // Explicit AI Prompt Refinement (with "No newline" instruction)
      const prompt = `
        As a medical triage AI, analyze these symptoms for department assignment:

        Patient ID: ${patientId}
        Symptoms: ${symptoms}
        Requested Department: ${department}

        Available Doctors:
        ${doctors.map(d => `id:${d.doctorId} ${d.name} (${d.specialization}): ${d.queueSize} patients waiting`).join("\n")}

        IMPORTANT: 
        DO NOT include any newline characters or extra formatting in your response. 
        Please return the response in a SINGLE LINE with the following format:

        "description****recommendedDoctor"
        Example response: "Patient has joint pain when sitting for long hours****doctorId123"
        STRICT FORMAT REQUIRED: No markdown, no newlines, no extra formatting. 
      `;

      // Call AI for doctor recommendation
      const result = await supportAgent.run(prompt);
      console.log("AI Result:", result);

      

      // Extract and sanitize response text
      let responseText = result.output[0].content;

      // Strict Sanitization Process
      // responseText = responseText
      //   .replace(/\\\"/g, '"') // Replace escaped quotes with regular quotes
      //   .replace(/[\n\r]+/g, ' ') // Replace any newline or carriage return with a single space
      //   .replace(/^"|"$/g, '') // Remove leading and trailing quotes
      //   .replace(/ +/g, ' ') // Replace multiple spaces with a single space
      //   .trim(); // Extra trimming to avoid any edge spaces

      // Ensure strict format with no extra characters (replace any remaining weird characters)
      // responseText = responseText.replace(/[^ -~]+/g, '').trim(); // Remove any non-printable ASCII characters

      // console.log("Sanitized Response:", responseText);

      // Split response into description and recommended doctor
      const responseParts = responseText.split("****");
        console.log("Response Parts:", responseParts);
      if (responseParts.length !== 2) {
        throw new Error(`Invalid AI response format. Received: ${responseText}`);
      }

      let [description, recommendedDoctor] = responseParts;
       description = description.substring(1);  // Removes the first character

      // Modify recommendedDoctor: Remove the last 3 characters
      recommendedDoctor = recommendedDoctor.substring(0, recommendedDoctor.length - 2);

      console.log("Description:", description);
      console.log("Recommended Doctor:", recommendedDoctor);
      // Check if recommended doctor exists
      const doctorExists = doctors.some(d => d.doctorId === recommendedDoctor);
      if (!doctorExists) {
        throw new Error(`Invalid doctor assignment: ${recommendedDoctor} does not exist.`);
      }

      // Update Token
      const token = await Token.findOneAndUpdate(
        { tokenId },
        {
          $set: {
            description,
            assignedDoctor: recommendedDoctor,
            status: "Consulting"
          }
        },
        { new: true }
      );

      // Update queue
      queue[department][recommendedDoctor].push(token);
      return { success: true, token };

    } catch (error) {
      console.error("Error in AI doctor assignment:", error);
      return { success: false, error: error.message };
    }
  }
);

// Function for dynamic doctor assignment
export const dynamicDoctorAssignment = inngest.createFunction(
  { id: "dynamic-doctor-ai", name: "Dynamic Doctor Assignment" },
  { event: "ai/doctor.assignment" },
  async ({ event }) => {
    try {
      const { tokenId, context, department } = event.data;
      const token = await Token.findOne({ tokenId });

      const doctors = hospitalData.doctors
        .filter(d => d.department === department)
        .map(d => ({
          ...d,
          queueSize: queue[department][d.doctorId]?.length || 0
        }));

      // Explicit AI Prompt Refinement (with "No newline" instruction)
      const prompt = `
        Medical token routing assistance needed:

        Current Department: ${token.currentDepartment}
        Patient History: ${context || "No prior steps"}
        Original Symptoms: ${token.symptoms}

        Available Doctors:
        ${doctors.map(d => `id:${d.doctorId} ${d.name} (${d.specialization}): ${d.queueSize} patients waiting`).join("\n")}

        IMPORTANT: 
        DO NOT include any newline characters or extra formatting in your response. 
        Please return the response in a SINGLE LINE with the following format:

        "description****recommendedDoctor"
        Example response: "Patient has joint pain when sitting for long hours****doctorId123"
        STRICT FORMAT REQUIRED: No markdown, no newlines, no extra formatting. 
      `;

      // Call AI
      const result = await supportAgent.run(prompt);
      console.log("AI Result:", result);

      if (!result?.output?.[0]?.content) {
        throw new Error("AI response is missing or malformed.");
      }

      // Extract and sanitize response text
      let responseText = result.output[0].content;

      // Strict Sanitization Process
      // responseText = responseText
      //   .replace(/\\\"/g, '"') // Replace escaped quotes with regular quotes
      //   .replace(/[\n\r]+/g, ' ') // Replace any newline or carriage return with a single space
      //   .replace(/^"|"$/g, '') // Remove leading and trailing quotes
      //   .replace(/ +/g, ' ') // Replace multiple spaces with a single space
      //   .trim(); // Extra trimming to avoid any edge spaces

      // Ensure strict format with no extra characters (replace any remaining weird characters)
      // responseText = responseText.replace(/[^ -~]+/g, '').trim(); // Remove any non-printable ASCII characters

      // console.log("Sanitized Response:", responseText);

      // Split response into description and recommended doctor

      const responseParts = responseText.split("****");
        console.log("Response Parts:", responseParts);
      if (responseParts.length !== 2) {
        throw new Error(`Invalid AI response format. Received: ${responseText}`);
      }

      let [description, recommendedDoctor] = responseParts;
       description = description.substring(1);  // Removes the first character

      // Modify recommendedDoctor: Remove the last 3 characters
      recommendedDoctor = recommendedDoctor.substring(0, recommendedDoctor.length - 2);

      console.log("Description:", description);
      console.log("Recommended Doctor:", recommendedDoctor);


      // Check if recommended doctor exists
      const doctorExists = doctors.some(d => d.doctorId === recommendedDoctor);
      if (!doctorExists) {
        throw new Error(`Invalid doctor assignment: ${recommendedDoctor} does not exist.`);
      }

      // Update token
      await Token.updateOne(
        { tokenId },
        {
          assignedDoctor: recommendedDoctor,
          description
        }
      );

      
      queue[department][recommendedDoctor].push(token);

      return { success: true };

    } catch (error) {
      console.error("Error in dynamic AI doctor assignment:", error);
      return { success: false, error: error.message };
    }
  }
);
