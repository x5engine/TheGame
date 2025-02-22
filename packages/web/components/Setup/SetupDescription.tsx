import { Flex, Textarea } from '@metafam/ds';
import { composeDBProfileFieldDescription } from '@metafam/utils';
import { useGetOwnProfileFieldFromComposeDB } from 'lib/hooks/ceramic/useGetOwnProfileFromComposeDB';
import { usePlayerSetupSaveToComposeDB } from 'lib/hooks/ceramic/usePlayerSetupSaveToComposeDB';
import React, { useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { useShowToastOnQueryError } from './SetupProfile';
import { WizardPane } from './WizardPane';

const field = composeDBProfileFieldDescription;

export const SetupDescription: React.FC = () => {
  const {
    fetching,
    error,
    result: existing,
  } = useGetOwnProfileFieldFromComposeDB<string>(field);

  useShowToastOnQueryError(error);

  const formMethods = useForm<{ [field]: string | undefined }>({
    mode: 'onTouched',
  });
  const {
    watch,
    setValue,
    formState: { dirtyFields },
  } = formMethods;

  useEffect(() => {
    setValue(field, existing);
  }, [existing, setValue]);

  const current = watch(field, existing);
  const dirty = current !== existing || !!dirtyFields[field];

  const { onSubmit, status } = usePlayerSetupSaveToComposeDB({
    isChanged: dirty,
  });

  return (
    <FormProvider {...formMethods}>
      <WizardPane
        {...{ field, onSubmit, status, fetching }}
        title="Bio"
        prompt="This is where you get to tell the world who you are! What interests you? What are you up to these days? What are your goals & aspirations?? Why are you here???"
      >
        <DescriptionField />
      </WizardPane>
    </FormProvider>
  );
};

const DescriptionField: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const { ref: registerRef, ...props } = register(field, {
    maxLength: {
      value: 420,
      message: 'Maximum length is 420 characters.',
    },
  });

  return (
    <Flex justify="center" mt={5}>
      <Textarea
        maxW="36rem"
        placeholder="Come on now, don't be shy… 🙃"
        h="10em"
        color="white"
        _focus={errors[field] ? { borderColor: 'red' } : undefined}
        bg="dark"
        ref={(ref) => {
          ref?.focus();
          registerRef(ref);
        }}
        {...props}
      />
    </Flex>
  );
};
