/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et cindent: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef AudioContext_h_
#define AudioContext_h_

#include "nsWrapperCache.h"
#include "nsCycleCollectionParticipant.h"
#include "mozilla/Attributes.h"
#include "nsCOMPtr.h"
#include "EnableWebAudioCheck.h"
#include "nsAutoPtr.h"

class JSContext;
class nsIDOMWindow;

namespace mozilla {

class ErrorResult;

namespace dom {

class AudioDestinationNode;
class AudioBufferSourceNode;
class AudioBuffer;
class GainNode;

class AudioContext MOZ_FINAL : public nsWrapperCache,
                               public EnableWebAudioCheck
{
  explicit AudioContext(nsIDOMWindow* aParentWindow);

public:
  virtual ~AudioContext();

  NS_INLINE_DECL_CYCLE_COLLECTING_NATIVE_REFCOUNTING(AudioContext)
  NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_NATIVE_CLASS(AudioContext)

  nsIDOMWindow* GetParentObject() const
  {
    return mWindow;
  }

  virtual JSObject* WrapObject(JSContext* aCx, JSObject* aScope,
                               bool* aTriedToWrap);

  static already_AddRefed<AudioContext>
  Constructor(nsISupports* aGlobal, ErrorResult& aRv);

  AudioDestinationNode* Destination() const
  {
    return mDestination;
  }

  already_AddRefed<AudioBufferSourceNode> CreateBufferSource();

  already_AddRefed<AudioBuffer>
  CreateBuffer(JSContext* aJSContext, uint32_t aNumberOfChannels,
               uint32_t aLength, float aSampleRate,
               ErrorResult& aRv);

  already_AddRefed<GainNode>
  CreateGain();

private:
  nsCOMPtr<nsIDOMWindow> mWindow;
  nsRefPtr<AudioDestinationNode> mDestination;
};

}
}

#endif

