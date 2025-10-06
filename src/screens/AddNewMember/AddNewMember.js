import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import appTheme from "../../utils/Theme";
import MemberDetailsPage from "./MemberDetailsPage";
import SchemeDetailsPage from "./SchemeDetailsPage";


const { COLORS, SIZES } = appTheme;

const AddNewMember = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();
  const { schemeId } = route.params || {};

  // Member Details State
  const [memberData, setMemberData] = useState({
    namePrefix: "Mr",
    name: "",
    surname: "",
    doorNo: "",
    address1: "",
    address2: "",
    area: "",
    city: "",
    pincode: "",
    selectedState: "",
    country: "India",
    mobile: "",
    email: "",
    panNumber: "",
    aadharNumber: "",
    dob: null,
  });

  // Scheme Details State
  const [schemeData, setSchemeData] = useState({
    selectedSchemeId: null,
    selectedGroupCodeObj: null,
    selectedCurrentRegNoObj: null,
    amount: "",
    accCode: "",
    modePay: "C",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = "https://akj.brightechsoftware.com";

  useEffect(() => {
    if (schemeId) {
      setSchemeData(prev => ({ ...prev, selectedSchemeId: schemeId }));
    }
  }, [schemeId]);

  const handleBack = () => {
    navigation.navigate("MainLanding");
  };

  const getDefaultInitial = (firstName) => {
    if (!firstName || firstName.trim().length === 0) return "";
    return firstName.trim().charAt(0).toUpperCase();
  };

  const handleNextStep = (memberFormData) => {
    setMemberData(memberFormData);
    setCurrentStep(2);
  };

  const handleSubmit = async (schemeFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSchemeData(schemeFormData);

    console.log("---- SUBMIT STARTED ----");

    const newMember = {
      title: memberData.namePrefix,
      initial: getDefaultInitial(memberData.name),
      pName: memberData.name,
      sName: memberData.surname,
      doorNo: memberData.doorNo,
      address1: memberData.address1,
      address2: memberData.address2,
      area: memberData.area,
      city: memberData.city,
      state: memberData.selectedState,
      country: memberData.country,
      pinCode: memberData.pincode,
      mobile: memberData.mobile,
      idProof: "Aadhaar",
      idProofNo: memberData.aadharNumber,
      panNumber: memberData.panNumber,
      dob: memberData.dob ? memberData.dob.toISOString().split("T")[0] : "",
      email: memberData.email,
      upDateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
      userId: "999",
      appVer: "19.12.10.1",
    };

    let createSchemeSummary;
    if (schemeFormData.selectedSchemeId === 7) {
      createSchemeSummary = {
        schemeId: schemeFormData.selectedSchemeId,
        groupCode: "DGA",
        regNo: (Math.random() * 100000).toFixed(0),
        joinDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        upDateTime2: new Date().toISOString().slice(0, 19).replace("T", " "),
        openingDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId2: "9999",
        goldWeightGram: parseFloat(schemeFormData.calculatedWeight || "0"),
      };
    } else {
      createSchemeSummary = {
        schemeId: schemeFormData.selectedSchemeId,
        groupCode: schemeFormData.selectedGroupCodeObj,
        regNo: schemeFormData.selectedCurrentRegNoObj,
        joinDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        upDateTime2: new Date().toISOString().slice(0, 19).replace("T", " "),
        openingDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId2: "9999",
      };
    }

    const schemeCollectInsert = {
      amount: parseFloat(schemeFormData.amount),
      modePay: schemeFormData.modePay,
      accCode: schemeFormData.accCode,
    };

    const requestBody = {
      newMember,
      createSchemeSummary,
      schemeCollectInsert,
    };

    console.log("Final Request Body:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/v1/api/member/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.log("Error parsing response JSON:", e);
        }
        throw new Error(
          "Error creating member: " + (errorData.message || response.statusText)
        );
      }

      const responseData = await response.text();
      console.log("Success Response Data:", responseData);

      Alert.alert("Success", "Member added successfully!", [
        { text: "OK", onPress: () => navigation.navigate("MainLanding") },
      ]);

      resetFormFields();
    } catch (error) {
      console.error("Error during member creation:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      console.log("---- SUBMIT ENDED ----");
      setIsSubmitting(false);
    }
  };

  const resetFormFields = () => {
    setMemberData({
      namePrefix: "Mr",
      name: "",
      surname: "",
      doorNo: "",
      address1: "",
      address2: "",
      area: "",
      city: "",
      pincode: "",
      selectedState: "",
      country: "India",
      mobile: "",
      email: "",
      panNumber: "",
      aadharNumber: "",
      dob: null,
    });

    setSchemeData({
      selectedSchemeId: null,
      selectedGroupCodeObj: null,
      selectedCurrentRegNoObj: null,
      amount: "",
      accCode: "",
      modePay: "C",
    });

    setValidationErrors({});
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MemberDetailsPage
            memberData={memberData}
            onNext={handleNextStep}
            onBack={handleBack}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        );
      case 2:
        return (
          <SchemeDetailsPage
            schemeData={schemeData}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(1)}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            isSubmitting={isSubmitting}
            API_BASE_URL={API_BASE_URL}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default AddNewMember;